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

    if (isFavorite) {
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

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      'M6.855,14.365l-1.817,6.36c-0.115,0.402,0.034,0.835,0.372,1.082c0.34,0.247,0.797,0.257,1.145,0.024L12,18.202l5.445,3.63 C17.613,21.944,17.807,22,18,22c0.207,0,0.414-0.064,0.59-0.192c0.338-0.247,0.487-0.68,0.372-1.082l-1.817-6.36l4.48-3.584 c0.308-0.247,0.442-0.651,0.343-1.033s-0.414-0.67-0.804-0.734l-5.497-0.916l-2.772-5.545c-0.34-0.678-1.449-0.678-1.789,0 L8.333,8.098L2.836,9.014c-0.39,0.064-0.704,0.353-0.804,0.734s0.035,0.786,0.343,1.033L6.855,14.365z'
    );

    btn.appendChild(svg);
    svg.appendChild(path);

    return btn;
  }
}
