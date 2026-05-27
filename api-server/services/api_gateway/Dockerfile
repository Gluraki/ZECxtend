FROM openresty/openresty:alpine-fat

RUN apk add --no-cache \
    curl \
    gcc \
    musl-dev \
    make \
    openssl-dev \
    perl \
    git \
    unzip

RUN /usr/local/openresty/luajit/bin/luarocks install lua-resty-openidc
RUN /usr/local/openresty/luajit/bin/luarocks install lua-resty-session
RUN /usr/local/openresty/luajit/bin/luarocks install lua-resty-http

COPY nginx.conf /usr/local/openresty/nginx/conf/nginx.conf

COPY lua /etc/nginx/lua

EXPOSE 80

CMD ["openresty", "-g", "daemon off;"]