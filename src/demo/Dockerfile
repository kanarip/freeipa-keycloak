FROM httpd:2.4

RUN sed -i \
        -e 's/^#\(Include .*httpd-ssl.conf\)/\1/' \
        -e 's/^#\(LoadModule .*mod_ssl.so\)/\1/' \
        -e 's/^#\(LoadModule .*mod_socache_shmcb.so\)/\1/' \
        conf/httpd.conf

RUN sed -r -i \
        -e 's/^ServerName.*$/ServerName demo.example.local:443/g' \
        conf/extra/httpd-ssl.conf

RUN touch /usr/local/apache2/conf/server.{crt,key}
