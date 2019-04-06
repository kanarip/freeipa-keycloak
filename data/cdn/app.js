let d = new Date();

// should have theme
function load_css(url, callback) {
    var head = document.head;
    var link = document.createElement('link');

    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    link.media = 'all';
    link.onreadystagechange = callback;
    link.onload = callback;

    head.appendChild(link);
}

function load_script(url, callback) {
    // Adding the script tag to the head as suggested before
    var head = document.head;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

var initialize = function() {
    document.body.innerHTML = "<p>Today's date is " + d + "</p>";
    document.body.innerHTML += "<p>Timezone: " + Intl.DateTimeFormat().resolvedOptions().timeZone + "</p>";
    document.body.innerHTML += "<p>Language: " + window.navigator.language + "</p>";

    // This should probably be the one to use, because we can iterate over languages until one is available.
    document.body.innerHTML += "<p>Language(s): " + window.navigator.languages + "</p>";

    $(document).ready(
        function() {
            document.body.innerHTML += "<table><tr><th>And you are?</th></tr><tr><td><input type='text' name='username' value='jeroen@example.local'></td></tr></table>";

            load_script('https://keycloak.example.local:8443/auth/js/keycloak.js', start_keycloak);
        }
    );
}

var start_keycloak = function() {
    console.log('loading!');
    $(document).ready(
        function() {
            console.log('loading for realz!');
            var username = $('input[name="username"]').val();
            var realm = username.split("@")[1];
            var server = 'api.' + realm;
            var resource = location.hostname;

            var keycloak = Keycloak(
                {
                    // A keycloak container
                    url: 'https://keycloak.example.local:8443/auth/',
                    realm: realm,
                    clientId: resource
                }
            );

            keycloak.init(
                { onLoad: 'login-required' }
            ).success(
                function(authenticated) {
                    document.body.innerHTML += "<p>" + (authenticated ? 'authenticated' : 'not authenticated') + "</p>";
                }
            );

            keycloak.onAuthSuccess = function() {
                var url = 'https://' + server + '/' + username;

                console.log('url: ' + url);

                document.body.innerHTML += '<p>' + keycloak.token + '</p>';

                var req = new XMLHttpRequest();

                req.open('GET', url, true);

                req.setRequestHeader('Accept', 'application/json');
                req.setRequestHeader('Authorization', 'Bearer ' + keycloak.token);

                req.onreadystatechange = function () {
                    if (req.readyState == 4) {
                        if (req.status == 200) {
                            document.body.innerHTML += "<pre>" + JSON.stringify(JSON.parse(req.responseText), undefined, 4) + "</pre>";
                        } else if (req.status == 403) {
                            alert('Forbidden');
                        }
                    }
                }

                req.send();

                document.body.innerHTML += "<p>Subject: " + keycloak.subject + "</p>";
                document.body.innerHTML += "<p>Name: " + keycloak.idTokenParsed.name + "</p>";
                document.body.innerHTML += "<p>Given name: " + keycloak.idTokenParsed.given_name + "</p>";
                document.body.innerHTML += "<p>Preferred username: " + keycloak.idTokenParsed.preferred_username + "</p>";
                document.body.innerHTML += "<p>Email address: " + keycloak.idTokenParsed.email + "</p>";

                keycloak.loadUserProfile(
                    function() {
                        document.body.innerHTML += "<p>Account Service</p>";
                        document.body.innerHTML += "<p>username: " + keycloak.profile.username + "</p>";
                        document.body.innerHTML += "<p>email: " + keycloak.profile.email + "</p>";
                        document.body.innerHTML += "<p>firstname + lastname: " + keycloak.profile.firstName + ' ' + keycloak.profile.lastName + "</p>";
                        document.body.innerHTML += "<p>firstname: " + keycloak.profile.firstName + "</p>";
                        document.body.innerHTML += "<p>lastname: " + keycloak.profile.lastName + "</p>";
                    }, function() {
                        document.body.innerHTML += "<p>Failed to retrieve user details. Please enable claims or account role</p>";
                    }
                );
            }
        }
    );
}

load_css('https://cdn.example.local/spinner.css');

// shouldn't do this, should take jeroen@demo.kolab.org, use 'demo.kolab.org', find an end-point
// somehow. we'd use demo.klab.cc to bring this point home.
load_script('https://cdn.example.local/jquery.js', initialize);
