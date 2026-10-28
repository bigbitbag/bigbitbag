(async function () {
 try {
  const response = await fetch('./theme/config/site.json');
  if (!response.ok) throw new Error('站点配置加载失败');
  const site = await response.json(); window.knowledgeSite = site; document.title = site.name;
  window.$docsify = {name:site.name, homepage:site.homepage || 'HOME.md',loadSidebar:'/theme/generated/sidebar.md',alias:{'/.*/theme/generated/sidebar.md':'/theme/generated/sidebar.md'},relativePath:true,subMaxLevel:0,auto2top:true,search:{paths:'auto',placeholder:'搜索笔记',noData:'没有找到相关结果',depth:6,namespace:'bigbitbag-notes'}};
  const files = ['../theme.js','docsify.min.js','prism-bash.min.js','prism-python.min.js','prism-powershell.min.js','prism-json.min.js','prism-yaml.min.js','prism-makefile.min.js','prism-markdown.min.js','prism-markup-templating.min.js','prism-php.min.js','prism-sql.min.js','search.min.js'];
  for (const file of files) await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='./theme/vendor/'+file;script.onload=resolve;script.onerror=()=>reject(new Error('资源加载失败：'+file));document.body.appendChild(script);});
 } catch(error) {document.getElementById('app').textContent=error.message+'，请通过 HTTP 服务器预览。';}
})();
