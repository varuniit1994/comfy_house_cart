const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "5j0rrxo308si",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "KAMyXgvyHiRkIvZ4DbaaLLXeDA0TNXUDDlIr-CebyLo"
});

console.log(client);


//variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartbtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

//console.log(btns);

//cart
let cart = [];
//buttons
let buttonsDOM = [];

//getting the products
class Products {
  async getproducts() {
    try {


      let contentful = await client.getEntries({
        content_type: "comfyHouseProducts"
      });

      console.log(contentful);

      let result = await fetch("products.json");
      let data = await result.json();


      // let products = data.items;
      let products = contentful.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;

        return {
          title,
          price,
          id,
          image,
        };
      });

      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//display products
class UI {
  // display product method this method adds the products inther DOM.
  displayProducts(products) {
    //console.log(products);
    let result = "";
    products.forEach((product) => {
      result =
        result +
        `<article class="product">
          <div class="img-container">
            <img
              src=${product.image}
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              Add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>${product.price}</h4>
        </article>
       `;
    });
    productsDOM.innerHTML = result;
  }

  //getBagButton Method
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    // console.log(buttons);
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      //console.log(id);
      let inCart = cart.find((item) => item.id == id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disable = true;
      }
      button.addEventListener("click", (event) => {
        //console.log(event.target.innerText);
        event.target.innerText = "In Cart";
        event.target.disabled = true;

        //get the product from the product from the local storage
        let cartItem = Storage.getproduct(id);
        // console.log(cartItem);
        cartItem = { ...cartItem, amount: 1 };
        //console.log(cartItem);
        //adding product to the cart and
        cart = [...cart, cartItem];
        //console.log(cart);
        //saving cart on the localStorage
        Storage.saveCart(cart);
        //set cart value
        this.setCartValues(cart);
        //display cart item
        this.addCartItem(cartItem);
        //show the cart
        this.showCart();
      });
    });
  }

  // set cart value method this set the total of the cart and item total
  setCartValues(cart) {
    let priceTotal = 0;
    let itemTotal = 0;
    cart.map((item) => {
      priceTotal += item.price * item.amount;
      itemTotal += item.amount;
    });
    // console.log("tTotal items :" + itemTotal);
    // console.log("price:" + priceTotal);
    cartTotal.innerText = parseFloat(priceTotal.toFixed(2));
    cartItems.innerText = itemTotal;
  }

  // adding a  new element to the cart-item in the DOM
  addCartItem(newcartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    let cartItem = `
    <img src=${newcartItem.image} alt="product" />
      <div>
        <h4>${newcartItem.title}</h4>
        <h5>$${newcartItem.price}</h5>
        <span class="remove-item" data-id=${newcartItem.id}>remove</span>
      </div>
      <div>
        <i class="fas fa-chevron-up" data-id=${newcartItem.id}></i>
        <p class="item-amount">${newcartItem.amount}</p>
        <i class="fas fa-chevron-down" data-id=${newcartItem.id}></i>
      </div>`;

    div.innerHTML = cartItem;
    cartContent.appendChild(div);
  }

  //show cart method
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  //setup method
  setUpApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populate(cart);
    cartBtn.addEventListener("click", (event) => {
      this.showCart();
    });
    closeCartBtn.addEventListener("click", (event) => {
      this.hideCart();
    });
  }

  //hide cart function
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  //populate cart
  populate(cart) {
    cart.forEach((item) => {
      this.addCartItem(item);
    });
  }

  //cartLogic
  cartLogic() {
    //clear cart Button
    clearCartbtn.addEventListener("click", (event) => {
      this.clearCart();
    });
    //cart functionality

    cartContent.addEventListener("click", (event) => {

      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        //console.log(removeItem);
        let id = removeItem.dataset.id;
        //console.log(removeItem.parentElement.parentElement);
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeCartItem(id);
      }
      else
        if (event.target.classList.contains("fa-chevron-up")) {
          let addAmountItem = event.target;
          let id = addAmountItem.dataset.id;
          //let product = Storage.getproduct(id);
          let tempItem = cart.find((item) => item.id === id);
          //console.log(tempItem.amount);
          tempItem.amount += 1;
          Storage.saveCart(cart);
          this.setCartValues(cart);
          addAmountItem.nextElementSibling.innerText = tempItem.amount;
        }
        else
          if (event.target.classList.contains("fa-chevron-down")) {
            let subAmountItem = event.target;
            let id = subAmountItem.dataset.id;
            let tempItem = cart.find((item) => item.id === id);

            // console.log(tempItem.amount);

            if (tempItem.amount == 1) {
              cartContent.removeChild(subAmountItem.parentElement.parentElement);
              this.removeCartItem(id);

            }
            else {
              tempItem.amount = tempItem.amount - 1;
              Storage.saveCart(cart);
              this.setCartValues(cart);
              subAmountItem.previousElementSibling.innerText = tempItem.amount;
            }

          }

      //console.log(event.target);
    });
  }

  //clear cart
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    //console.log(cartItems);
    cartItems.forEach((id) => {
      this.removeCartItem(id);
    });
    //console.log(cartContent);
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  //remove cart item method
  removeCartItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    //console.log(button);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"><i/> add to cart`;
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getproduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    if (localStorage.getItem("cart")) {
      return JSON.parse(localStorage.getItem("cart"));
    } else {
      return [];
    }
  }
}

//After  DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  //setup app
  ui.setUpApp();

  //get all products
  products
    .getproducts()
    .then((products) => {
      // console.log(products);
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
