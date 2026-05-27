local oidc = require("resty.openidc")

local opts = {
    discovery = os.getenv("OIDC_DISCOVERY"),
    client_id = os.getenv("OIDC_CLIENT_ID"),

    bearer_only = true,

    ssl_verify = "no",
}

local res, err = oidc.authenticate(opts)

if err then
    ngx.status = 401
    ngx.header.content_type = "application/json"

    ngx.say(require("cjson").encode({
        detail = err
    }))

    return ngx.exit(401)
end

local claims = res.id_token or res.access_token

ngx.req.set_header("X-User-Id", claims.sub or "")
ngx.req.set_header("X-Email", claims.email or "")
ngx.req.set_header("X-Role", claims.role or "")
ngx.req.set_header("X-Team-Id", tostring(claims.team_id or ""))
ngx.req.clear_header("Authorization")