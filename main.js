async function fetchFile(file, cache) {
  if (cache[file]) return cache[file];
  
  const response = await fetch(file);
  if (!response.ok) throw new Error(`Network response was not ok for ${file}`);
  
  const data = await response.text();
  cache[file] = data;
  return data;
}

async function processElement(el, cache) {
  const file = el.getAttribute("data-include");
  if (file) {
    try {
      let data = await fetchFile(file, cache);
      const content = JSON.parse(el.getAttribute("data-content") || "{}" || "${}");
      
      Object.keys(content).forEach(key => {
        const regex = new RegExp(`{${key}}`, "g");
        data = data.replace(regex, content[key]);
      });

      el.innerHTML = data;
      el.removeAttribute("data-include");

      // Process nested includes
      await includeHTML(el, cache);
    } catch (error) {
      console.error(`Error fetching the file "${file}":`, error);
    }
  }
}

async function includeHTML(parentElement = document, cache = {}) {
  const elements = parentElement.querySelectorAll("[data-include]");
  const promises = Array.from(elements).map(el => processElement(el, cache));
  await Promise.all(promises);
}

document.addEventListener("DOMContentLoaded", () => {
  includeHTML().then(() => {
    console.log("All components have been included.");
  });
});