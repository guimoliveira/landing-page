const PROXY_URL = 'https://corsproxy.io/?';
const GITHUB_REPOS_URL = 'https://github.com/guimoliveira?tab=repositories&t=';
const GITHUB_URL = 'https://github.com/guimoliveira/';
const ITCH_IO_URL = 'https://guimoliveira.itch.io/?t=';
const GAME_JOLT_API_URL = 'https://gamejolt.com/site-api/web/library/games/developer/@guimoliveira?section=featured&t=';
const GAME_JOLT_URL = 'https://gamejolt.com/games/';

const TEXT_BOX_HTML = `<a href="link" target="_blank" class="box" title="description"><span>name</span><p>description</p></a>`;
const IMG_BOX_HTML = `<a href="link" target="_blank" class="img-box" style="background: url('icon')" title="description"><span>name</span></a>`;

function generateProxyURL(destination) {
    return PROXY_URL + encodeURIComponent(destination) + (new Date().getTime());
}

function request(url, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
        }
    };
    xhttp.open("GET", url);
    xhttp.send();
}

function fetchGitHubRepos(callback) {
    request(generateProxyURL(GITHUB_REPOS_URL), (response) => {
        const repos = [];
        let index = 0;

        while (true) {
            const startTitle = index = response.indexOf('codeRepository" >', index);
            if (index == -1) break;
            const endTitle = index = response.indexOf('</a>', index);
            if (index == -1) break;

            const endBlock = response.indexOf('</li>', index);

            const startDescription = index = response.indexOf('itemprop="description">', index);
            const endDescription = index = response.indexOf('</p>', index);

            const title = response.substring(startTitle + 18, endTitle).trim();
            let description = response.substring(startDescription + 23, endDescription).trim();

            if (startDescription > endBlock) {
                description = '';
                index = endBlock;
            }

            repos.push({title, description, link: GITHUB_URL + title});
        }

        callback(repos);
    });
}

function fetchItchIoGames(callback) {
    request(generateProxyURL(ITCH_IO_URL), (response) => {
        const games = [];
        let index = 0;

        while (true) {
            const startIcon = index = response.indexOf('data-lazy_src="', index);
            if (index == -1) break;
            const endIcon = index = response.indexOf('"', index + 15);
            if (index == -1) break;
            const startLink = index = response.indexOf('href="', index);
            if (index == -1) break;
            const endLink = index = response.indexOf('"', index + 6);
            if (index == -1) break;
            const startTitle = index = response.indexOf('>', index);
            if (index == -1) break;
            const endTitle = index = response.indexOf('</a>', index);
            if (index == -1) break;
            const startDescription = index = response.indexOf('title="', index);
            if (index == -1) break;
            const endDescription = index = response.indexOf('">', index);
            if (index == -1) break;
            
            games.push({
                icon: response.substring(startIcon + 15, endIcon).trim(),
                link: response.substring(startLink + 6, endLink).trim(),
                title: response.substring(startTitle + 1, endTitle).trim(),
                description: response.substring(startDescription + 7, endDescription).trim(),
            });
        }

        callback(games);
    });
}

function fetchGameJoltGames(callback) {
    request(generateProxyURL(GAME_JOLT_API_URL), (response) => {
        const data = JSON.parse(response);
        const games = data.payload.games;

        callback(games.map((game) => {
            return {
                title: game.title,
                icon: game.img_thumbnail,
                description: game.title,
                link: GAME_JOLT_URL + game.path + '/' + game.id
            };
        }));
    });
}

fetchGitHubRepos((repos) => {
    let html = '';
    for (let repo of repos) {
        html += TEXT_BOX_HTML.replace('name', repo.title)
                             .replaceAll('description', repo.description)
                             .replace('link', repo.link);
    }

    document.getElementById('loadingGitHubProjects').classList.add('hide');

    const items = document.getElementById('itemsGitHubProjects');
    items.classList.remove('hide');
    items.innerHTML = html;
});

fetchItchIoGames((games) => {
    let html = '';
    for (let game of games) {
        html += IMG_BOX_HTML.replace('name', game.title)
                            .replace('description', game.description)
                            .replace('icon', game.icon)
                            .replace('link', game.link);
    }

    document.getElementById('loadingItchIoGames').classList.add('hide');

    const items = document.getElementById('itemsItchIoGames');
    items.classList.remove('hide');
    items.innerHTML = html;
});

fetchGameJoltGames((games) => {
    let html = '';
    for (let game of games) {
        html += IMG_BOX_HTML.replace('name', game.title)
                            .replace('description', game.description)
                            .replace('icon', game.icon)
                            .replace('link', game.link);
    }

    document.getElementById('loadingGameJoltGames').classList.add('hide');

    const items = document.getElementById('itemsGameJoltGames');
    items.classList.remove('hide');
    items.innerHTML = html;
});

function animateSections() {
    const y = window.scrollY;
    const h = window.innerHeight;
    const bottom = y + h;

    const ySection1 = document.getElementsByClassName('primary')[0].offsetTop;
    const ySection2 = document.getElementsByClassName('secondary')[0].offsetTop;
    const ySection3 = document.getElementsByClassName('tertiary')[0].offsetTop;

    if (bottom > ySection1 - 100 && bottom < ySection1 + 200) {
        document.documentElement.style.setProperty('--rot-1', '10deg');
    } else if (bottom > ySection2 - 100 && bottom < ySection2 + 200) {
        document.documentElement.style.setProperty('--rot-2', '-10deg');
    } else if (bottom > ySection3 - 100) {
        document.documentElement.style.setProperty('--rot-3', '10deg');
    }
}

window.onscroll = animateSections;
window.onload = () => {
    document.getElementsByTagName('header')[0].style.opacity = '1';
    animateSections();
};