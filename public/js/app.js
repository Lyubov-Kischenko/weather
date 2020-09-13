class ExchangeView {
    constructor() {
        this.mainBlock = document.querySelector("#app");
        this.exchangeText = document.createElement("p");
        this.exchangeText.className = 'exchange';
    }

    initRender() {
        this.mainBlock.append(this.exchangeText);
    }

    renderExchangeWidget(value) {
        this.exchangeText.innerText = `Buy: ${value.buy} / Sale: ${value.sale}`;
    }
}

class ExchangeController {
    constructor(view) {
        this.view = view;
    }

    getExchangeData() {
        fetch('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')
            .then(response => response.json())
            .then(data => {
                this.view.renderExchangeWidget(data[0]);
            })
            .catch(function (err) {
                console.log(`Something goes wrong. Error: ${err}`);
            });
    }
}


class WeatherView {
    constructor() {
        this.mainBlock = document.querySelector("#app");
        this.form = document.createElement("form");
        this.form.className = "form-inline";
        this.formGroup = document.createElement('div');
        this.formGroup.className = "form-group";
        this.input = document.createElement("input");
        this.input.className = "form-control";
        this.formGroup.append(this.input);
        this.addButton = document.createElement("button");
        this.addButton.innerHTML = "ADD";
        this.addButton.className = "btn btn-primary";
        this.form.append(this.formGroup, this.addButton);
        this.cityList = document.createElement("div");
        this.cityList.className = "cities-list";
    }

    initReneder() {
        this.mainBlock.append(this.form, this.cityList);
    }

    renderTask(city) {
        const item = document.createElement("div");
        item.className = "card w-75";
        const body = document.createElement("div");
        body.setAttribute('id', city.id);
        body.className = "card-body";
        item.append(body);
        const text = document.createElement('p');
        text.className = 'editable';
        text.contentEditable = true;
        text.innerHTML = city.text;
        const removeButton = document.createElement("a");
        removeButton.innerHTML = "&#10008;";
        removeButton.className = "btn btn-danger";
        removeButton.setAttribute('data-id', city.id)
        body.append(text, removeButton);
        this.cityList.appendChild(item);
    }

    renderCities(cities) {
        this.cityList.innerHTML = '';
        cities.forEach((task) => {
            this.renderTask(task);
        });
    }
}

class WeatherController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.addData = this.addData.bind(this);
        this.showData = this.showData.bind(this);
        this.getGeoLocation = this.getGeoLocation.bind(this);
        this.editCity = this.editCity.bind(this);
    }

    addData() {
        let value = this.view.input.value;
        if (value) {
            this.model.addCity(value);
            this.view.renderCities(this.model.cities);
            this.view.input.value = '';
        }
    }

    dropData(id) {
        this.model.dropCity(id);
        this.view.renderCities(this.model.cities);
    }

    showData() {
        this.view.renderCities(this.model.cities);
    }

    editCity(id, text) {
        this.model.editCity(id, text);
        this.view.renderCities(this.model.cities);
    }

    addHandle() {
        this.showData();
        this.view.addButton.addEventListener("click", this.addData);

        this.view.cityList.addEventListener("click", ({ target }) => {
            let idValue = target.dataset.id;
            if (idValue) {
                this.dropData(idValue);
            }
        });

        this.view.cityList.addEventListener('input', ({ target }) => {
            if (target.className === 'editable') {
                this._temporaryTaskText = target.innerText
            }
        });

        this.view.cityList.addEventListener('focusout', ({ target }) => {
            if (this._temporaryTaskText) {
                const id = parseInt(target.parentElement.id)

                this.editCity(id, this._temporaryTaskText);
                this._temporaryTaskText = '';
            }
        })
    }
}

class WeatherModel {
    constructor() {
        this.cities = JSON.parse(localStorage.getItem('cities')) || [];
    }

    editCity(id, updatedText) {
        this.cities = this.cities.map(city =>
            city.id === id ? { id: city.id, text: updatedText } : city
        )
        this.save(this.cities);
    }

    addCity(value) {
        const city = {
            id: this.cities.length > 0 ? this.cities[this.cities.length - 1].id + 1 : 1,
            text: value,
        }
        this.cities.push(city);
        this.save(this.cities)
    }

    dropCity(id) {
        this.cities = this.cities.filter(city => city.id !== Number(id))
        this.save(this.cities)
    }

    editCity(id, updatedText) {
        this.cities = this.cities.map(city =>
            city.id === id ? { id: city.id, text: updatedText } : city
        )

        this.save(this.cities)
    }

    save(cities) {
        localStorage.setItem('cities', JSON.stringify(cities));
    }
}

(function init() {
    const exchangeView = new ExchangeView();
    const exchangeController = new ExchangeController(exchangeView);
    exchangeView.initRender();
    exchangeController.getExchangeData();
    setInterval(() => {
        exchangeController.getExchangeData();
    }, 1000 * 60 * 60);

    const weatherView = new WeatherView();
    const weatherModel = new WeatherModel();
    const weatherController = new WeatherController(weatherModel, weatherView);
    weatherView.initReneder();
    weatherController.addHandle();
})();