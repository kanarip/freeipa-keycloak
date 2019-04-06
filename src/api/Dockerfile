FROM fedora:30

RUN yum -y install \
        python3-aiohttp \
        python3-jwt && \
    yum clean all

ENTRYPOINT [ "/usr/bin/python3", "/data/api/api.py" ]
