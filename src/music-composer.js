/* Keep the first decision obvious; optional controls remain beside their content. */
(() => {
  document.addEventListener('DOMContentLoaded',()=>{
    const form=document.getElementById('upload-form');if(!form)return;
    const zh=()=>window.DaytoneLanguage?.get()==='zh';
    const makeGroup=(name,selectors)=>{
      const details=document.createElement('details');details.className='music-compose-group';const summary=document.createElement('summary');summary.textContent=name;details.append(summary);
      for(const selector of selectors){const target=form.querySelector(selector);if(target)details.append(target);}
      if(details.childElementCount>1)form.querySelector('.form-actions').before(details);return details;
    };
    // Enhancement scripts append their controls during the same DOMContentLoaded cycle.
    setTimeout(()=>{
      const labelFor=name=>form.elements[name]?.closest('label');
      for(const [name,id] of [['cover','compose-cover-field'],['video_url','compose-video-field'],['language','compose-language-field']]){const label=labelFor(name);if(label)label.id=id;}
      const intro=form.querySelector('.dialog-intro');if(intro)intro.textContent=zh()?'输入歌名，选择版本。':'Enter a song, choose a recording.';
      const videoGroup=makeGroup(zh()?'添加视频链接':'Add a video link',['#compose-video-field','.youtube-publish-preview']);
      const videoChoices=form.querySelector('.publish-video-results'),albumEntry=form.querySelector('.album-entry');if(videoChoices){if(albumEntry)form.elements.note.closest('label').after(albumEntry,videoChoices);else form.elements.note.closest('label').after(videoChoices);}
      makeGroup(zh()?'照片':'Photos',['#compose-cover-field','.song-photo-picker']);
      makeGroup(zh()?'分类与语言':'Category & language',['.upload-genres','#compose-language-field']);
      const otherSources=makeGroup(zh()?'其他音源':'Other sources',['.publish-source-search','.source-choice','#file-field','#link-field']);
      for(const button of form.querySelectorAll('button.link-read-button')){if(button.textContent==='Check link details'){const status=button.nextElementSibling;otherSources.append(button);if(status?.classList.contains('link-read-status'))otherSources.append(status);}}
      const paste=form.querySelector('.share-import');if(paste)otherSources.prepend(paste);
      form.querySelectorAll('.publish-source-preview').forEach(node=>{if(node.dataset.sourceField==='video_url')videoGroup.append(node);else otherSources.append(node);});
      const research=form.querySelector('.song-research');if(research){const more=document.createElement('details');more.className='music-compose-group';const heading=document.createElement('summary');heading.textContent=zh()?'创作背景与来源':'Context & source';more.append(heading,research);form.querySelector('.form-actions').before(more);}
      form.classList.add('music-composer');
    },0);
  });
})();
