FROM fedora:30

RUN yum -y install \
        augeas \
        bind-utils \
        bsdtar \
        bzip2 \
        cyrus-imapd \
        cyrus-sasl-plain \
        firefox \
        iproute \
        iputils \
        lsof \
        net-tools \
        nmap-ncat \
        openldap-clients \
        openssl \
        psmisc \
        python3-aiohttp \
        python3-aiohttp-cors \
        python3-aiohttp-negotiate \
        python3-jwt \
        python3-pip \
        strace \
        telnet \
        traceroute \
        unzip \
        vim-enhanced \
        wget \
        which && \
    yum clean all

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

ENTRYPOINT [ "/usr/bin/python3", "/data/api/api.py" ]
