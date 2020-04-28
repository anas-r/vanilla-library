export const createNewBook = (bookOBJECT) => {
    return new Proxy(bookOBJECT, {
        set: (target, property, value) => {
            if (!(property === 'title' || property === 'author' || property === 'description' || property === 'isRead')) {
                return false;
            } else if (property === 'title' || property === 'author' || property === 'description') {
                target[property] = value;
                const newBookPropertyDOM = document.querySelector(`#book-${target.id}`).querySelector(`.book-${property}`);
                newBookPropertyDOM.textContent = value;
                return true;
            } else {
                const newBookPropertyDOM = document.querySelector(`#book-${target.id}`);
                target.isRead = (value === true ? value : value === false ? value : target.isRead);
                newBookPropertyDOM.className = target.isRead ? "book book-read" : "book";
                return true;
            }
        }
    })
}

export const get = (bookDOM, property) => {
    return {
        DOM: bookDOM.querySelector(`.book-${property}`),
        text: bookDOM.querySelector(`.book-${property}`).textContent,
    };
}