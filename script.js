const products = [
  {id:1,name:"Orbit Headphones",price:2499,desc:"Wireless sound, made simple.",emoji:"◉",c1:"#d9e6a2",c2:"#74804b",shape:"round",tag:"BESTSELLER"},
  {id:2,name:"Everyday Backpack",price:1899,desc:"Room for all your essentials.",emoji:"▣",c1:"#c8a78c",c2:"#76543f",shape:"",tag:""},
  {id:3,name:"Aura Water Bottle",price:699,desc:"Hydration with a little style.",emoji:"♢",c1:"#a6c9cf",c2:"#47717a",shape:"slim",tag:""},
  {id:4,name:"Studio Desk Lamp",price:1299,desc:"A warm glow for late ideas.",emoji:"☼",c1:"#e8c77c",c2:"#9b7132",shape:"",tag:"NEW"},
  {id:5,name:"Classic Sneakers",price:2199,desc:"Your everyday go-to pair.",emoji:"⌁",c1:"#d8d5cd",c2:"#77736a",shape:"flat",tag:""},
  {id:6,name:"Minimal Watch",price:1599,desc:"A timeless finishing touch.",emoji:"◷",c1:"#d4c5a7",c2:"#75644b",shape:"round",tag:""}
];
let cart = {};
const grid = document.getElementById("productGrid");
const productSearch = document.getElementById("productSearch");
const noResults = document.getElementById("noResults");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const authDialog = document.getElementById("authDialog");
const checkoutDialog = document.getElementById("checkoutDialog");
const money = n => "₹" + n.toLocaleString("en-IN");

function renderProducts(query = ""){
  const searchTerm = query.trim().toLocaleLowerCase();
  const matchingProducts = products.filter(p => p.name.toLocaleLowerCase().includes(searchTerm));
  grid.innerHTML = matchingProducts.map(p => `
    <article class="product-card">
      <div class="product-art">
        ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
        <div class="shape ${p.shape}" style="--c1:${p.c1};--c2:${p.c2}">${p.emoji}</div>
      </div>
      <div class="product-info">
        <div class="product-top"><span class="product-name">${p.name}</span><span class="product-price">${money(p.price)}</span></div>
        <p class="product-desc">${p.desc}</p>
        <button class="add-btn" data-add="${p.id}">Add to cart <span>＋</span></button>
      </div>
    </article>`).join("");
  noResults.hidden = matchingProducts.length > 0;
}
function fieldError(field){
  const value=field.value.trim();
  if(field.required&&!value)return "This field is required.";
  if(!value)return "";
  if(field.type==="email"&&field.validity.typeMismatch)return "Enter a valid email address.";
  if(field.minLength>0&&value.length<field.minLength)return `Enter at least ${field.minLength} characters.`;
  if(field.dataset.format==="phone"&&(!/^[0-9+() -]+$/.test(value)||value.replace(/\D/g,"").length<7||value.replace(/\D/g,"").length>15))return "Enter a valid phone number.";
  if(field.dataset.format==="postal-code"&&!/^[A-Za-z0-9 -]{3,12}$/.test(value))return "Enter a valid postal code.";
  if(field.validity.patternMismatch)return field.type==="tel"?"Enter a valid phone number.":"Enter a valid postal code.";
  const match=field.dataset.match&&document.getElementById(field.dataset.match);
  if(match&&field.value!==match.value)return "Passwords do not match.";
  return "";
}
function validateField(field){
  const message=fieldError(field);
  const error=document.getElementById(`${field.id}Error`);
  if(message)field.setAttribute("aria-invalid","true");
  else field.removeAttribute("aria-invalid");
  error.textContent=message;
  error.hidden=!message;
  return !message;
}
function validateForm(form,focusInvalid=true){
  let valid=true;
  let firstInvalid=null;
  form.querySelectorAll("input,textarea,select").forEach(field=>{
    if(!validateField(field)){valid=false;firstInvalid=firstInvalid||field;}
  });
  if(firstInvalid&&focusInvalid)firstInvalid.focus();
  return valid;
}
function clearFormErrors(form){
  form.querySelectorAll("input,textarea,select").forEach(field=>{
    field.removeAttribute("aria-invalid");
    const error=document.getElementById(`${field.id}Error`);
    error.textContent="";
    error.hidden=true;
  });
  delete form.dataset.submitted;
}
function openAuthForm(type){
  const selected=authDialog.querySelector(`[data-auth-form="${type}"]`);
  authDialog.querySelectorAll("[data-auth-form]").forEach(form=>{form.hidden=form!==selected;});
  document.getElementById("authDialogTitle").firstChild.textContent=type==="login"?"Log in":"Create account";
  if(!authDialog.open)authDialog.showModal();
}
function addToCart(id){cart[id]=(cart[id]||0)+1;renderCart();showToast("Added to your cart");}
function changeQty(id,delta){cart[id]=(cart[id]||0)+delta;if(cart[id]<=0)delete cart[id];renderCart();}
function renderCart(){
  const entries=Object.entries(cart);
  const count=entries.reduce((sum,[,qty])=>sum+qty,0);
  document.getElementById("cartCount").textContent=count;
  const total=entries.reduce((sum,[id,qty])=>sum+products.find(p=>p.id===Number(id)).price*qty,0);
  document.getElementById("subtotal").textContent=money(total);
  const items=document.getElementById("cartItems");
  if(!entries.length){items.innerHTML='<div class="empty-cart"><span>▢</span><p>Your cart is waiting.</p><small>Add something you love.</small></div>';return;}
  items.innerHTML=entries.map(([id,qty])=>{
    const p=products.find(item=>item.id===Number(id));
    return `<div class="cart-item">
      <div class="mini-art" style="--c1:${p.c1};--c2:${p.c2}">${p.emoji}</div>
      <div><div class="cart-item-name">${p.name}</div><div class="cart-item-price">${money(p.price)}</div>
        <div class="quantity"><button data-change="${id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${qty}</span><button data-change="${id}" data-delta="1" aria-label="Increase quantity">＋</button></div>
      </div>
      <button class="remove-btn" data-remove="${id}" aria-label="Remove ${p.name}">×</button>
    </div>`;
  }).join("");
}
function openCart(){cartDrawer.classList.add("open");overlay.classList.add("open");cartDrawer.setAttribute("aria-hidden","false");}
function closeCart(){cartDrawer.classList.remove("open");overlay.classList.remove("open");cartDrawer.setAttribute("aria-hidden","true");}
let toastTimer;
function showToast(message){const toast=document.getElementById("toast");toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),1800);}

grid.addEventListener("click",e=>{const btn=e.target.closest("[data-add]");if(btn)addToCart(Number(btn.dataset.add));});
document.getElementById("cartItems").addEventListener("click",e=>{
  const change=e.target.closest("[data-change]"),remove=e.target.closest("[data-remove]");
  if(change)changeQty(Number(change.dataset.change),Number(change.dataset.delta));
  if(remove){delete cart[Number(remove.dataset.remove)];renderCart();}
});
document.getElementById("cartToggle").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
overlay.addEventListener("click",closeCart);
document.addEventListener("click",e=>{
  const authTrigger=e.target.closest("[data-open-auth]");
  const closeTrigger=e.target.closest("[data-close-dialog]");
  if(authTrigger)openAuthForm(authTrigger.dataset.openAuth);
  if(closeTrigger)closeTrigger.closest("dialog").close();
});
document.querySelectorAll("dialog").forEach(dialog=>{
  dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
});
document.querySelectorAll(".validated-form").forEach(form=>{
  form.addEventListener("submit",e=>{
    e.preventDefault();
    form.dataset.submitted="true";
    if(!validateForm(form))return;
    const submittedForm=form.id;
    form.reset();
    clearFormErrors(form);
    if(submittedForm==="contactForm"){
      showToast("Thanks! This demo doesn’t send messages yet.");
    }else if(submittedForm==="checkoutForm"){
      checkoutDialog.close();
      showToast("Details look good. Demo checkout — no payment is connected.");
    }else{
      authDialog.close();
      showToast("Your details look good. Account services aren’t connected yet.");
    }
  });
  form.addEventListener("input",e=>{
    if(form.dataset.submitted==="true")validateForm(form,false);
    else if(e.target.matches("[aria-invalid='true']"))validateField(e.target);
    const confirmation=form.querySelector(`[data-match="${e.target.id}"]`);
    if(confirmation&&confirmation.getAttribute("aria-invalid")==="true")validateField(confirmation);
  });
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeCart();});
document.getElementById("checkoutBtn").addEventListener("click",()=>{
  if(!Object.keys(cart).length){showToast("Your cart is empty");return;}
  checkoutDialog.showModal();
});
productSearch.addEventListener("input",()=>renderProducts(productSearch.value));
renderProducts();renderCart();