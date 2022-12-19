const root = document.createElement("div");
document.body.appendChild(root);

for (let i = 0; i < 500; i++) {
  const element = document.createElement('div');
  element.style.marginBottom = "8px";
  element.innerText = "div";

  element.addEventListener("mouseenter", () => {
    element.style.backgroundColor = "#eee"
  });

  element.addEventListener("mouseleave", () => {
    element.style.backgroundColor = ""
  });
  
  root.appendChild(element);
}