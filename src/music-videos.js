// Hand-checked official videos. These are choices, never automatic user endorsements.
(() => {
  const items = [
    {album:'1558162066',artist:'MF DOOM',name:'Beef Rapp',id:'XvKDFX00tsU'},
    {album:'1558162066',artist:'MF DOOM',name:'Hoe Cakes',id:'Mv6kY_-zt-4'},
    {album:'1558162066',artist:'MF DOOM',name:'Rapp Snitch Knishes',id:'dERcdvcXuE0'},
    {album:'887699504',artist:'Madvillain',name:'Accordion',id:'ru2IrTY2UG0'},
    {album:'887699504',artist:'Madvillain',name:'Rhinestone Cowboy',id:'lWpRJK_z08I'},
    {artist:'Kacey Musgraves',name:'Rainbow',id:'6OFv566mj7s'}
  ];
  const normal = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
  window.AilleursMusicVideos = {
    forAlbum: id => items.filter(item => item.album === id),
    find: (title, artist) => items.filter(item => normal(item.name) === normal(title) && normal(item.artist) === normal(artist)).map(item => ({...item,title:item.name,channel:item.artist,thumbnail:'https://i.ytimg.com/vi/'+item.id+'/hqdefault.jpg',url:'https://www.youtube.com/watch?v='+item.id}))
  };
})();
