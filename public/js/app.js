const apiKey = "87281a4fa208ee16ddfdfdaa43a194c9";
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

        this.form = document.createElement("div");
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

        this.currentLocation = document.createElement('div');
        this.currentLocation.className = "card w-75";
        this.cLBody = document.createElement('div');
        this.cLBody.className = "card-body";
        this.clBodyH5 = document.createElement('h5');
        this.clBodyDesc = document.createElement('p');
        this.cLBody.append(this.clBodyH5, this.clBodyDesc);
        this.currentLocation.append(this.cLBody);
    }

    initReneder() {
        this.mainBlock.append(this.currentLocation, this.form, this.cityList);
    }

    renderCity(city) {
        const item = document.createElement("div");
        item.className = "card w-75";
        const body = document.createElement("div");
        body.setAttribute('id', city.id);
        body.className = "card-body";
        item.append(body);
        const text = document.createElement('h5');
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
        cities.forEach((city) => {
            this.renderCity(city);
        });
    }

    updateCurrentCity(name, data) {
        this.clBodyH5.innerText = name;
        this.clBodyDesc.innerText = data;
    }
}

class WeatherController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.addData = this.addData.bind(this);
        this.showData = this.showData.bind(this);
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

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => this.model.setLocation([position.coords.latitude, position.coords.longitude]),
            );
        } else {
            this.model.setLocation(null);
        }

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
    constructor(view) {
        this.location = null;
        this.currCityName = null;
        this.currCityWeatherData = null;
        this.view = view;
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

    setLocation(location) {
        if (location) {
            this.location = location;
            this.getWeatherForLocation();
        }
    }

    getWeatherForLocation() {
        console.log(this.location)
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${this.location[0]}&lon=${this.location[1]}&appid=${apiKey}&units=metric`)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    console.log(data)
                    this.currCityName = data.name;
                    this.currCityWeatherData = `Temp: ${data.main.temp} C; Wind: ${data.wind.speed} mps; ${data.weather[0].description}`;
                }
            })
            .catch(function (err) {
                console.log(`Something goes wrong. Error: ${err}`);
            })
            .finally(() => {
                this.view.updateCurrentCity(this.currCityName, this.currCityWeatherData);
            });
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
    const weatherModel = new WeatherModel(weatherView);
    const weatherController = new WeatherController(weatherModel, weatherView);
    weatherView.initReneder();
    weatherController.addHandle();
})();