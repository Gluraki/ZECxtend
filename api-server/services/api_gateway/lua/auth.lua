local jwt = require("resty.jwt")
local validators = require("resty.jwt-validators")
local cjson = require("cjson")

jwt:set_alg_whitelist({ HS256 = 1 })

local claim_spec = {
    exp = validators.is_not_expired(),
    sub = validators.required(),
    role = validators.required(),
    id = validators.required(),
    typ = validators.equals("access"),
}

local SAFE_METHODS = {
    GET = true,
    HEAD = true,
    OPTIONS = true,
}

local secret = os.getenv("JWT_SECRET_KEY")
local api_key = os.getenv("API_KEY")
local api_key_digest = api_key and api_key ~= "" and ngx.sha1_bin(api_key) or nil

local M = {}

local function deny(status, detail)
    ngx.status = status
    ngx.header.content_type = "application/json"

    if status == 401 then
        ngx.header["WWW-Authenticate"] = "Bearer"
    end

    ngx.say(cjson.encode({ detail = detail }))

    return ngx.exit(status)
end

local function bearer_token()
    local header = ngx.var.http_authorization

    if not header then
        return nil
    end

    return header:match("^[Bb][Ee][Aa][Rr][Ee][Rr]%s+(.+)$")
end

local function header_safe(value)
    if value == nil or value == cjson.null then
        return nil
    end

    value = tostring(value)

    if value == "" or value:find("%c") then
        return nil
    end

    return value
end

local function role_allowed(role, allowed)
    if not allowed then
        return true
    end

    for _, candidate in ipairs(allowed) do
        if role == candidate then
            return true
        end
    end

    return false
end

local function enforce_api_key(opts, method, provided)
    if not api_key_digest or ngx.sha1_bin(provided) ~= api_key_digest then
        return deny(401, "Invalid API-Key - Gateway")
    end

    if not (opts.api_key_methods and opts.api_key_methods[method]) then
        return deny(403, "API-Key not allowed here - Gateway")
    end

    ngx.var.auth_user_id = "0"
    ngx.var.auth_username = "api-key"
    ngx.var.auth_role = "ADMIN"
    ngx.var.auth_team_id = ""
end

function M.enforce(opts)
    opts = opts or {}

    if not secret or secret == "" then
        ngx.log(ngx.ERR, "JWT_SECRET_KEY is unset, cannot verify tokens")
        return deny(500, "Gateway is misconfigured - Gateway")
    end

    local method = ngx.req.get_method()
    local token = bearer_token()

    if not token then
        local provided_key = ngx.var.http_x_api_key

        if provided_key then
            return enforce_api_key(opts, method, provided_key)
        end

        if opts.anonymous_methods and opts.anonymous_methods[method] then
            return
        end

        return deny(401, "Missing bearer token - Gateway")
    end

    local verified = jwt:verify(secret, token, claim_spec)

    if not verified.verified then
        return deny(401, verified.reason or "Invalid token - Gateway")
    end

    local claims = verified.payload
    local allowed

    if SAFE_METHODS[method] then
        allowed = opts.read_roles
    else
        allowed = opts.write_roles
    end

    if not role_allowed(claims.role, allowed) then
        return deny(403, "Insufficient role - Gateway")
    end

    local user_id = header_safe(claims.id)
    local username = header_safe(claims.sub)
    local role = header_safe(claims.role)

    if not user_id or not username or not role then
        return deny(401, "Malformed claims - Gateway")
    end

    ngx.var.auth_user_id = user_id
    ngx.var.auth_username = username
    ngx.var.auth_role = role
    ngx.var.auth_team_id = header_safe(claims.team_id) or ""
end

return M
