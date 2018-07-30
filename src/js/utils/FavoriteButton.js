class FavoriteButton {
  /**
   * Creates a favorite button from the given button element.
   * If no element is passed, a new element is created.
   * The initial state can also be determined by the isFavorite parameter
   */
  constructor(buttonElement, isFavorite) {
    if (buttonElement) {
      this.domButton = buttonElement;
    } else {
      this.domButton = FavoriteButton.createElement();
    }

    if (isFavorite === true || isFavorite === 'true') {
      this.updateState();
    }
  }

  addEventListener(event, listener) {
    const boundListener = listener.bind(this);

    this.domButton.addEventListener(event, (...args) => {
      this.updateState();
      boundListener(...args);
    });
  }

  updateState() {
    const isFavorite = this.domButton.classList.contains('favorite');

    if (isFavorite) {
      this.domButton.classList.remove('favorite');
      this.domButton.setAttribute('title', FavoriteButton.ADD_LABEL);
      this.domButton.setAttribute('aria-label', FavoriteButton.ADD_LABEL);
    } else {
      this.domButton.classList.add('favorite');
      this.domButton.setAttribute('title', FavoriteButton.REMOVE_LABEL);
      this.domButton.setAttribute('aria-label', FavoriteButton.REMOVE_LABEL);
    }
  }

  get domElement() {
    return this.domButton;
  }

  static get ADD_LABEL() {
    return 'Add restaurant to favorites';
  }

  static get REMOVE_LABEL() {
    return 'Remove restaurant from favorites';
  }

  static createElement() {
    const btn = document.createElement('button');
    btn.setAttribute('title', FavoriteButton.ADD_LABEL);
    btn.setAttribute('aria-label', FavoriteButton.ADD_LABEL);
    btn.classList.add('favorite-btn');

    const span = document.createElement('span');
    span.innerText = '★';

    btn.appendChild(span);

    return btn;
  }
}
