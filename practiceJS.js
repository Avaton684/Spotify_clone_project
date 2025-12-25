let audio = new Audio
let songlist = document.querySelector('.songlist ul')
let currentSongs = []
let currentIndex = 0
let currentFolder = ''



function formatTime(seconds) {
    let sec = Math.floor(seconds % 60);
    let min = Math.floor(seconds / 60);
    if (sec < 10) { sec = '0' + sec }
    if (min < 10) { min = '0' + min }
    return `${min}:${sec}`
}

let a = fetch('http://127.0.0.1:3000/songs/ncs/')
    .then(response => {
        return response.text()
    })
    .then(data => {
        currentSongs = []
        currentIndex = 0
        currentFolder = "ncs"
        songlist.innerHTML = "";
        let div = document.createElement('div')
        div.innerHTML = data
        let as = div.getElementsByTagName('a')
        Array.from(as).forEach(e => {
            if (e.href.endsWith('mp3')) {
                let songName = decodeURI(e.href).replaceAll('\\', '/').split('/').pop()
                currentSongs.push(songName)
                let li = document.createElement('li')
                li.innerHTML = `<img class = 'invert' src = 'Images/music.svg'>
                                <div class = 'info song-info'>
                                <div class='songname'>${songName.replace('.mp3', '')}</div>
                                <div class='artistname'>Unknown Artist</div>
                                </div>
                                <div class='playnow'>
                                <span>Play Now</span>
                                <img class = 'invert' src = 'Images/playbtn.svg'>                                
                                </div>`
                songlist.appendChild(li)
                li.addEventListener('click', () => {
                    // audio.src = `/songs/ncs/${songName}`
                    // audio.play()

                    // currentIndex = currentSongs.indexOf(songName)
                    // playMusic();


                    const clickedIndex = currentSongs.indexOf(songName);
                    console.log(clickedIndex + 'and ' + currentIndex)

                    if (clickedIndex !== currentIndex || audio.src == '') {
                        currentIndex = clickedIndex;
                        playMusic();
                        return
                    } else {
                        audio.paused ? audio.play() : audio.pause();
                    }

                })
            }
        })
        audio.addEventListener('timeupdate', () => {
            document.querySelector('.songtime').innerHTML = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`
        })
        document.querySelector('.range').addEventListener('input', e => {
            audio.volume = e.target.value / 100
        })
        document.querySelector('.volimg').addEventListener('click', (e) => {
            // audio.muted = !audio.muted
            if (e.target.src.includes('Images/volumehigh.svg')) {
                e.target.src = e.target.src.replace('Images/volumehigh.svg', 'Images/mute.svg')
                audio.volume = 0
                document.querySelector('.range').getElementsByTagName('input')[0].value = 0
            }
            else {
                e.target.src = e.target.src.replace('Images/mute.svg', 'Images/volumehigh.svg')
                audio.volume = 0.20
                document.querySelector('.range').getElementsByTagName('input')[0].value = 10

            }
        })
    })






//******************************************
/* getAlbums(), createAlbumcards(), loadSong() and playSong() - they work togather to get json and cover img data from folder and show it on UI and when clicked playlist show that folder shong list on left and u can play it from there

1. getAlbums() function is created for getting data from folder json file than send it 
2. createAlbumcard() it will show these json data and cover img as a card on UI than 
3. laodSongs() use when card clicked it will load songs from floder to left songlist and 
4. playSong() use to play song when clicked on song present on left */
//******************************************
async function getAlbums() {
    let res = await fetch('http://127.0.0.1:3000/songs/')
    let html = await res.text()

    let div = document.createElement('div')
    div.innerHTML = html

    let anchors = div.getElementsByTagName('a')

    for (let a of anchors) {

        // anchor text gives clean folder name
        let folder = a.innerText.trim()

        // skip invalid links
        if (
            !folder ||
            folder === "../" ||
            folder === "Parent Directory" ||
            folder === "songs"
        ) {
            continue
        }

        try {
            let infoRes = await fetch(
                `http://127.0.0.1:3000/songs/${folder}/info.json`
            )

            if (!infoRes.ok) {
                console.warn(`info.json missing for ${folder}`)
                continue
            }

            let info = await infoRes.json()
            createAlbumcard(folder, info)

        } catch (err) {
            console.error(`Error loading album ${folder}`, err)
        }
    }
}


function createAlbumcard(folder, info) {
    let cardContainer = document.querySelector('.cardContainer');

    let card = document.createElement('div');
    card.className = "card";
    card.innerHTML = `
    <img src="/songs/cs/cover.jpg" alt="${info.title}">     
    <h2>${info.title}</h2>
    <p>${info.description}</p>     
    `;

    card.addEventListener('click', () => {
        loadSongs(folder);
    });
    cardContainer.appendChild(card)

}

// async function loadSongs(folder) {
//     currentSongs = []
//     currentIndex = 0
//     currentFolder = folder

//     audio.pause()
//     audio.currentTime = 0;

//     let res = await fetch(`http://127.0.0.1:3000/songs/${folder}/`);
//     let html = await res.text();

//     let div = document.createElement('div');
//     div.innerHTML = html;

//     songlist.innerHTML = "";

//     Array.from(div.getElementsByTagName('a')).forEach(a => {
//         if (a.href.endsWith('.mp3')) {
//             let songName = decodeURI(a.href)
//                 .replaceAll('\\', '/')
//                 .split('/')
//                 .pop();
//             currentSongs.push(songName)

//             let li = document.createElement("li");
//             li.innerHTML = `<img class = 'invert' src = 'Images/music.svg'>
//                                 <div class = 'info song-info'>
//                                 <div class='songname'>${songName.replace('.mp3', '')}</div>
//                                 <div class='artistname'>Unknown Artist</div>
//                                 </div>
//                                 <div class='playnow'>
//                                 <span>Play Now</span>
//                                 <img class = 'invert' src = 'Images/playbtn.svg'>                                
//                                 </div>`


//             li.addEventListener('click', () => {
//                 const clickedIndex = currentSongs.indexOf(songName);
//                 console.log(clickedIndex + 'and ' + currentIndex)

//                 if (clickedIndex !== currentIndex || audio.src == '') {
//                     currentIndex = clickedIndex;
//                     playMusic();
//                     return
//                 } else {
//                     audio.paused ? audio.play() : audio.pause();
//                 }
//             });
//             songlist.appendChild(li)
//         }
//     });

//     if (currentSongs.length > 0) {
//         currentIndex = 0;
//         playMusic();
//     }

// }

// function playMusic() {
//     if (!currentSongs.length) return;

//     const newSrc = `/songs/${currentFolder}/${currentSongs[currentIndex]}`;


//     if (audio.src !== location.origin + newSrc) {
//         audio.src = newSrc;
//     }

//     audio.play();
// }



// function updatePlayIcons() {
//     document.querySelectorAll('.playnow img').forEach((img, i) => {
//         img.src =
//             i === currentIndex && !audio.paused
//                 ? '/Images/pausebtn.svg'
//                 : '/Images/playbtn.svg';
//     });
// }

// audio.addEventListener('play', updatePlayIcons);
// audio.addEventListener('pause', updatePlayIcons);


// const playBtn = document.querySelector('#play');
// audio.addEventListener('play', () => {
//     playBtn.src = 'Images/pausebtn.svg';
// });

// audio.addEventListener('pause', () => {
//     playBtn.src = 'Images/playbtn.svg';
// });
// playBtn.addEventListener('click', () => {
//     if (!currentSongs.length) return;

//     if (audio.paused) {
//         audio.play();
//     } else {
//         audio.pause();
//     }
// });



// document.querySelector("#previous").addEventListener("click", () => {
//     if (!currentSongs.length) return;

//     if (currentIndex > 0) {
//         currentIndex--;
//         playMusic();
//     }
// });

// document.querySelector("#next").addEventListener("click", () => {
//     if (!currentSongs.length) return;

//     if (currentIndex < currentSongs.length - 1) {
//         currentIndex++;
//         playMusic();
//     }
// });

// audio.addEventListener("ended", () => {
//     if (currentIndex < currentSongs.length - 1) {
//         currentIndex++;
//         playMusic();
//     }
// });

// getAlbums();

async function loadSongs(folder) {
    currentSongs = []
    currentIndex = 0
    currentFolder = folder

    let res = await fetch(`http://127.0.0.1:3000/songs/${folder}/`);
    let html = await res.text();

    let div = document.createElement('div')
    div.innerHTML = html

    songlist.innerHTML = "";

    Array.from(div.getElementsByTagName('a')).forEach(a => {
        if (a.href.endsWith('.mp3')) {
            let songName = decodeURI(a.href).replaceAll('\\', '/').split('/').pop()
            currentSongs.push(songName)

            let li = document.createElement('li');
            li.innerHTML = `<img class = 'invert' src = 'Images/music.svg'>
                                 <div class = 'info song-info'>
                                 <div class='songname'>${songName.replace('.mp3', '')}</div>
                                 <div class='artistname'>Unknown Artist</div>
                                 </div>
                                 <div class='playnow'>
                                 <span>Play Now</span>
                                 <img class = 'invert' src = 'Images/playbtn.svg'>                                
                                 </div>`
            li.addEventListener('click', ()=>{
                const clickedIndex = currentSongs.indexOf(songName);
                console.log(clickedIndex + ' and ' + currentIndex)
                if(clickedIndex !== currentIndex || audio.src == ''){
                    currentIndex = clickedIndex;
                    playMusic()
                    return
                }
                else{
                    audio.paused ? audio.play() : audio.pause();
                }
            });
            songlist.appendChild(li)
        }
    })
    if (currentSongs.length > 0) {
        currentIndex = 0;
        playMusic();
    }
}

function playMusic(){
    if(!currentSongs.length) return;

    const newSrc = `/songs/${currentFolder}/${currentSongs[currentIndex]}`;

    if(audio.src !== location.origin + newSrc){
        audio.src = newSrc;
    }
    audio.play();
}

function updatePlayIcons(){
    document.querySelectorAll('.playnow img').forEach((img, i) => {
        img.src = i === currentIndex && !audio.paused
        ? '/Images/pausebtn.svg'
        : '/Images/playbtn.svg';
    });
}

audio.addEventListener('play', updatePlayIcons);
audio.addEventListener('pause', updatePlayIcons);

const playBtn = document.querySelector('#play');
audio.addEventListener('pause', () => {
    playBtn.src = 'Images/playbtn.svg'
});
playBtn.addEventListener('click', () => {
    if(!currentSongs.length) return;

    if(audio.paused){
        audio.play();
    }else{
        audio.pause();
    }
});

document.querySelector('#previous').addEventListener('click', () => {
    if(!currentSongs.length) return;

    if(currentIndex > 0) {
        currentIndex--;
        playMusic();
    }
});

document.querySelector('#next').addEventListener('click', () => {
    if(!currentSongs.length) return;

    if(currentIndex < currentSongs.length - 1){
        currentIndex++;
        playMusic();
    }
});

audio.addEventListener('ended', ()=>{
    if(currentIndex < currentSongs.length - 1){
        currentIndex++;
        playMusic()
    }
})
getAlbums();