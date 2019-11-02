const path = require('path');
const child_process = require('child_process');

const works = {
    'comic.cmn-Hans-CN':
    {
        'hhcool':
            []
	}
};

const crawl = () => {
    for (const kind of Object.keys(works)) {
        const kindSites = works[kind];
        for (const site of Object.keys(kindSites)) {
            const siteWorks = kindSites[site];
            for (const work of siteWorks) {
                try {
                    child_process.spawnSync(
                        'node',
                        [
                            path.join(__dirname, kind, site + '.js'),
                            work,
                            'allow_EOF_error=true',
                            'MIN_LENGTH=64',
                        ],
                        {
                         stdio: 'inherit',
                         cwd: path.join(__dirname, kind), 
                        }
                    )
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }
}

crawl().then(() => {

})