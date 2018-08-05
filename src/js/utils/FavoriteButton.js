export class FavoriteButton {
  /**
   * Creates a favorite button from the given button element.
   * If no element is passed, a new element is created.
   * The initial state can also be determined by the isFavorite parameter
   */
  constructor(buttonElement, initAsFavorite = false) {
    if (buttonElement) {
      this.domButton = buttonElement;
    } else {
      this.domButton = FavoriteButton.createElement();
    }

    this.setState(initAsFavorite);
  }

  addEventListener(event, listener) {
    const boundListener = listener.bind(this);

    this.domButton.addEventListener(event, (...args) => {
      this.updateState();
      boundListener(...args);
    });
  }

  updateState() {
    // If now is favorite after update it won't
    // If now is not favorite after update it will
    this.setState(!this.isFavorite);
  }

  setState(isFavorite) {
    if (isFavorite === true || isFavorite === "true") {
      this.domButton.classList.add("favorite");
      this.domButton.setAttribute("title", FavoriteButton.REMOVE_LABEL);
      this.domButton.setAttribute("aria-label", FavoriteButton.REMOVE_LABEL);
    } else {
      this.domButton.classList.remove("favorite");
      this.domButton.setAttribute("title", FavoriteButton.ADD_LABEL);
      this.domButton.setAttribute("aria-label", FavoriteButton.ADD_LABEL);
    }
  }

  get isFavorite() {
    return this.domButton.classList.contains("favorite");
  }

  get domElement() {
    return this.domButton;
  }

  static get ADD_LABEL() {
    return "Add restaurant to favorites";
  }

  static get REMOVE_LABEL() {
    return "Remove restaurant from favorites";
  }

  static createElement() {
    const btn = document.createElement("button");
    btn.setAttribute("title", FavoriteButton.ADD_LABEL);
    btn.setAttribute("aria-label", FavoriteButton.ADD_LABEL);
    btn.classList.add("favorite-btn");

    const span = document.createElement("span");
    span.innerText = "★";

    btn.appendChild(span);

    return btn;
  }
}
