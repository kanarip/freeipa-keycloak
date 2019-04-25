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
        freeipa-client \
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
        python3-pytest \
        strace \
        telnet \
        traceroute \
        unzip \
        vim-enhanced \
        wget \
        which && \
    dnf clean all

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

ENTRYPOINT [ "/bin/bash", "/data/test/test.sh" ]
