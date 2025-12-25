let currentSong = new Audio
let songs;
let currFolder;

function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);

    // Add leading zero if needed
    if (sec < 10) sec = "0" + sec;
    if (min < 10) min = "0" + min;

    return `${min}:${sec}`;
}


async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let url = decodeURIComponent(element.href);  // removes %20 and %5C
            url = url.replaceAll("\\", "/");             // convert backslashes to forward slashes
            songs.push(url.split("/").pop());            // final clean file name


        }

    }



    // Show all songs in the playlist
    let songUL = document.querySelector('.songlist').getElementsByTagName('ul')[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
                        <li>
                            <img class="invert" src="Images/music.svg" alt="">
                            <div class="info">
                                <div class="songname">${song}</div>
                                <div class="artistname">Rizwan</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="Images/playbtn.svg" alt="">
                            </div>
                        </li>
        `
    }
    // Attach and EventListener to each song
    Array.from(document.querySelector('.songlist').getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', () => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    });
    return songs

}

let playMusic = (track, pause = false) => {
    // let audio = new Audio('/songs/' + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = 'Images/pausebtn.svg'
    }
    document.querySelector('.songinfo').innerHTML = decodeURI(track)
    document.querySelector('.songtime').innerHTML = "00:00 / 00:00"
}

async function displayAlbum() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector('.cardContainer')
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("songs")) {

            // try {
            // 1. Decode %5C etc.
            let href = decodeURIComponent(e.href).replaceAll("\\", "/");

            // 2. Extract folder name (second last segment)
            let parts = href.split("/");
            let folder = parts[parts.length - 2];

            // 3. Fetch album metadata
            let res = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);

            if (!res.ok) return; // skip silently if missing

            let metadata = await res.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <button
                                style="background-color: #1fdf64; border-radius: 100%; padding: 10px; border: none;">
                                <span class="material-symbols-outlined">
                                    play_arrow
                                </span></button>
                        </div>

                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${metadata.title}</h2>
                        <p>${metadata.description}</p>
                    </div>`

            // You can now use metadata.title, metadata.description etc.
            // displayAlbum(folder, metadata);  // example custom function

            // } catch (err) {
            // console.error("Error loading album metadata:", err);
            // }
        }
    }

    // Load the playlist whichever card is clicked
    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener('click', async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

}


async function main() {
    // get the song lists
    await getSongs("songs/ncs")
    playMusic(songs[0], true)


    // Display all the albums on the page
    displayAlbum();


    // Attach and EventListener to previous play and next song
    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = 'Images/pausebtn.svg'
        }
        else {
            currentSong.pause()
            play.src = 'Images/playbtn.svg'
        }
    })

    // Event Listener to timeupdate event
    currentSong.addEventListener('timeupdate', () => {
        document.querySelector('.songtime').innerHTML = `${formatTime(currentSong.currentTime)}:${formatTime(currentSong.duration)}`
        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%'
    })

    // listener for seekbar
    document.querySelector('.seekbar').addEventListener('click', e => {
        let precent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
        currentSong.currentTime = ((currentSong.duration) * precent) / 100
    })

    // Event listener for menu 
    document.querySelector('.menu').addEventListener('click', () => {
        document.querySelector('.left').style.left = '0'
        document.querySelector('.cancel').style.display = 'block'
        document.querySelector('.playbar').style.width = '70vw'
        document.querySelector('.playbar').style.left = '28%'
        document.querySelector('.seekbar').style.width = '65vw'
        // document.querySelector('.seekbar').style.left = '6%'

    })

    // Event listener for cancel 
    document.querySelector('.cancel').addEventListener('click', () => {
        document.querySelector('.left').style.left = '-120%'
        document.querySelector('.cancel').style.display = 'none'
        document.querySelector('.playbar').style.width = '95vw'
        document.querySelector('.playbar').style.left = '1%'
        document.querySelector('.seekbar').style.width = '90vw'
        // document.querySelector('.seekbar').style.left = '1%'
    })

    // Event listener for previousbtn
    document.querySelector("#previous").addEventListener('click', () => {
        let currentName = decodeURIComponent(currentSong.src.split("/").pop());
        let index = songs.indexOf(currentName);

        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });


    // Event listener for nextbtn
    document.querySelector("#next").addEventListener('click', () => {
        let currentName = decodeURIComponent(currentSong.src.split("/").pop());
        let index = songs.indexOf(currentName);

        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });


    // Event listener for volume
    document.querySelector('.range').getElementsByTagName('input')[0].addEventListener('change', (e) => {
        console.log("Setting Volume to", e.target.value, " / 100")
        currentSong.volume = parseInt(e.target.value) / 100
    })

    // Event listener for mute volume of track
    document.querySelector('.volimg').addEventListener('click', (e) => {
        console.log(e.target);
        if (e.target.src.includes('Images/volumehigh.svg')) {
            e.target.src = e.target.src.replace("Images/volumehigh.svg", "Images/mute.svg")
            currentSong.volume = 0
            document.querySelector('.range').getElementsByTagName('input')[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("Images/mute.svg", "Images/volumehigh.svg")
            currentSong.volume = 0.10
            document.querySelector('.range').getElementsByTagName('input')[0].value = 10
        }
    });


}
main()