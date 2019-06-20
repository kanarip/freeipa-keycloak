FROM fedora:30

LABEL maintainer="Jeroen van Meeuwen (Kolab Systems) <vanmeeuwen@kolabsys.com>"

ENV container docker
ENV SYSTEMD_PAGER=''

RUN echo "zchunk=False" >> /etc/dnf/dnf.conf
RUN dnf -y update librepo && \
    dnf clean all

RUN dnf -y install \
        augeas \
        bind-utils \
        bsdtar \
        bzip2 \
        cyrus-imapd \
        cyrus-sasl-plain \
        firefox \
        git \
        iproute \
        iputils \
        lsof \
        net-tools \
        nmap-ncat \
        openldap-clients \
        openssl \
        psmisc \
        python3-jwt \
        python3-pip \
        procps-ng \
        psmisc \
        strace \
        telnet \
        traceroute \
        unzip \
        vim-enhanced \
        wget \
        which && \
    dnf clean all

RUN pip3 install hypercorn quart quart-openapi

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV QUART_APP api:main
ENV QUART_DEBUG 1

WORKDIR /data/api/

ENTRYPOINT [ \
        "/usr/local/bin/hypercorn", \
        "--debug", \
        "--reload", \
        "-w", "1", \
        "--bind", "0.0.0.0:443", \
        "--ca-certs", "/data/api/ca.cert", \
        "--certfile", "/data/api/api.cert", \
        "--keyfile", "/data/api/api.key", \
        "api:app" \
    ]

EXPOSE 443/tcp
