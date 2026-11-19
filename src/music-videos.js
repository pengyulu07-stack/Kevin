// Hand-checked official videos. These are choices, never automatic user endorsements.
(() => {
  const items = [
    {album:'1558162066',artist:'MF DOOM',name:'Beef Rapp',id:'XvKDFX00tsU'},
    {album:'1558162066',artist:'MF DOOM',name:'Hoe Cakes',id:'Mv6kY_-zt-4'},
    {album:'1558162066',artist:'MF DOOM',name:'Rapp Snitch Knishes',id:'dERcdvcXuE0'},
    {album:'887699504',artist:'Madvillain',name:'Accordion',id:'ru2IrTY2UG0'},
    {album:'887699504',artist:'Madvillain',name:'Rhinestone Cowboy',id:'lWpRJK_z08I'},
    {artist:'Kacey Musgraves',name:'Rainbow',id:'6OFv566mj7s'}
,
    {"album": "1440653096", "artist": "Portishead", "name": "Glory Box", "id": "4qQyUi4zfDs"},
    {"album": "1109714933", "artist": "Radiohead", "name": "Nude", "id": "BbWBRnDK_AE"},
    {"album": "1463409338", "artist": "Tyler, The Creator", "name": "EARFQUAKE", "id": "HmAsUQEFYGI"},
    {"album": "697194953", "artist": "Daft Punk", "name": "One More Time", "id": "FGBhQbmPwH8"},
    {"album": "724466069", "artist": "Massive Attack", "name": "Teardrop", "id": "u7K72X4eo_s"},
    {"album": "20833577", "artist": "Björk", "name": "Jóga", "id": "loB0kmz_0MM"}
  ];
  const normal = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
  window.AilleursMusicVideos = {
    forAlbum: id => items.filter(item => item.album === id),
    find: (title, artist) => items.filter(item => normal(item.name) === normal(title) && normal(item.artist) === normal(artist)).map(item => ({...item,title:item.name,channel:item.artist,thumbnail:'https://i.ytimg.com/vi/'+item.id+'/hqdefault.jpg',url:'https://www.youtube.com/watch?v='+item.id}))
  };
})();
