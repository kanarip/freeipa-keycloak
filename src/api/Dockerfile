FROM httpd:2.4

RUN sed -i \
        -e 's/^#\(Include .*httpd-ssl.conf\)/\1/' \
        -e 's/^#\(LoadModule .*mod_ssl.so\)/\1/' \
        -e 's/^#\(LoadModule .*mod_socache_shmcb.so\)/\1/' \
        conf/httpd.conf

RUN echo "SetEnvIf Origin \"http(s)?://(.*)\$\" AccessControlAllowOrigin=\$0" >> conf/httpd.conf
RUN echo "Header always set Access-Control-Allow-Origin %{AccessControlAllowOrigin}e env=AccessControlAllowOrigin" >> conf/httpd.conf
RUN echo "Header always set Access-Control-Allow-Headers \"authorization\"" >> conf/httpd.conf
