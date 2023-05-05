<template>
  <v-app>
    <v-main class="primary">
      <v-row class="fill-height pa-0 ma-0">
        <v-col cols="8" class="fill-height pa-0 ma-0 left-side">
          <v-container class="py-10 px-16">
            <div
              class="toggle"
              :class="{ active: isFahrenheit }"
              @click="isFahrenheit = !isFahrenheit"
            >
              <div
                class="toggle-side"
                :class="{ 'primary--text': !isFahrenheit }"
              >
                ºC
              </div>
              <div
                class="toggle-side"
                :class="{ 'primary--text': isFahrenheit }"
              >
                ºF
              </div>
            </div>

            <div class="view mt-10">
              <div class="view-temperature">
                {{ convertTemprerature(weatherData.current.temp) }}
              </div>
              <div class="view-icon">
                <img :src="getImage(weatherData.current)" />
              </div>
              <div
                class="view-description white--text text-center font-weight-light"
              >
                <p class="ma-0">
                  Hoje temos
                  {{ weatherData.current.weather[0].description }}
                </p>
                <p>
                  Agora com
                  {{ convertTemprerature(weatherData.current.temp) }}
                  {{ isFahrenheit ? "F" : "C" }}
                  , com máxima de
                  {{ convertTemprerature(weatherData.daily[0].temp.max) }}
                  {{ isFahrenheit ? "F" : "C" }}
                </p>
              </div>
            </div>

            <v-speed-dial
              v-model="alert"
              direction="left"
              :absolute="true"
              :top="true"
              :right="true"
              :open-on-hover="true"
              transition="slide-x-reverse-transition"
            >
              <template v-slot:activator>
                <v-btn
                  v-model="alert"
                  color="warning"
                  dark
                  fab
                  small
                  elevation="4"
                >
                  <v-icon v-if="alert">
                    fas fa-times
                  </v-icon>
                  <v-icon v-else>
                    fas fa-exclamation
                  </v-icon>
                </v-btn>
              </template>

              <v-card width="350px" class="rounded-lg" elevation="4">
                <v-card-text>
                  <div>
                    <p class="title mb-0">{{ weatherData.alerts[0].event }}</p>
                    <p class="caption">
                      {{ weatherData.alerts[0].description }}
                    </p>
                    <p class="caption secondary-text">
                      -{{ weatherData.alerts[0].sender_name }}
                    </p>
                  </div>
                </v-card-text>
              </v-card>
            </v-speed-dial>
          </v-container>

          <div class="graphic">
            <v-sparkline
              class="graphic-chart pr-6"
              :fill="true"
              line-width="0"
              padding="0"
              smooth="10"
              :value="temperatures"
              color="#0038B6"
              auto-draw
              :auto-line-width="true"
            ></v-sparkline>
            <div
              class="graphic-time secondary px-6 pr-12 py-4 d-flex align-end justify-space-between"
            >
              <div
                class="caption white--text"
                v-for="(time, index) in times"
                :key="index"
              >
                {{ time }}
              </div>
            </div>
          </div>
        </v-col>

        <v-col cols="4" class="fill-height pa-0 ma-0 white right-side ">
          <v-container class="pa-8 pt-10">
            <div class="nav d-flex align-center justify-space-between">
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                rounded
                depressed
                class="text-none"
                @click="seacrhCity = true"
              >
                <v-icon left small>fas fa-plus</v-icon> Cidade
              </v-btn>
            </div>

            <div class="header mt-6 d-flex align-center justify-space-between">
              <h1 class="display-1 font-weight-normal text-truncate">
                {{ cities[cityView].name }}
              </h1>

              <div class="header-actions" v-if="cities.length > 1">
                <v-btn
                  text
                  icon
                  :ripple="false"
                  @click="goCity('left')"
                  :disabled="cityView == 0 || loadCity"
                >
                  <v-icon center small>fas fa-chevron-left</v-icon>
                </v-btn>
                <v-btn
                  text
                  icon
                  :ripple="false"
                  @click="goCity('right')"
                  :disabled="cityView == cities.length - 1 || loadCity"
                >
                  <v-icon center small>fas fa-chevron-right</v-icon>
                </v-btn>
              </div>
            </div>

            <v-tabs-items v-model="cityView">
              <v-tab-item v-for="city in cities" :key="city">
                <div class="list-load text-center" v-if="loadCity">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    :size="50"
                    :width="5"
                  ></v-progress-circular>
                </div>

                <div class="list mt-6" v-else>
                  <div
                    class="days pb-4"
                    v-for="(day, index) in weatherData.daily"
                    :key="index"
                  >
                    <div class="days-icon">
                      <img :src="getImage(day)" />
                    </div>
                    <div class="days-temperature">
                      {{ convertTemprerature(day.temp.day) }}
                    </div>
                    <div class="days-date">
                      <div class="days-date-day">{{ getDay(day.dt) }}</div>
                      <div class="days-date-mounth">{{ getMonth(day.dt) }}</div>
                    </div>
                  </div>
                </div>
              </v-tab-item>
            </v-tabs-items>
          </v-container>
        </v-col>
      </v-row>

      <v-dialog
        transition="dialog-top-transition"
        width="500"
        v-model="seacrhCity"
        scrollable
      >
        <v-card>
          <v-card-text>
            <v-autocomplete
              v-model="model"
              chips
              multiple
              hide-no-data
              color="white"
              placeholder="Pesquise uma cidade"
              return-object
              :itens="listCities"
              item-text="name"
              item-value="coord"
            ></v-autocomplete>
          </v-card-text>

          <v-expand-transition>
            <v-list v-if="model" class="red lighten-3">
              <v-list-item v-for="(field, i) in fields" :key="i">
                <v-list-item-content>
                  <v-list-item-title v-text="field.value"></v-list-item-title>
                  <v-list-item-subtitle
                    v-text="field.key"
                  ></v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-expand-transition>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script>
import weatherMap from "./assets/weatherMap.json";
import listCities from "./assets/listCities.json";

export default {
  name: "App",
  data: () => ({
    model: null,
    search: null,
    entries: [],
    listCities: listCities,
    fill: true,
    padding: 8,
    radius: 10,
    width: 2,
    isFahrenheit: false,
    times: [],
    temperatures: [],
    weatherData: {},
    alert: false,
    cityView: 0,
    loadCity: true,
    seacrhCity: false,
    cities: [
      {
        id: 3663517,
        name: "Manaus",
        state: "",
        country: "BR",
        coord: {
          lon: -60.025002,
          lat: -3.10194,
        },
      },
      {
        id: 3663503,
        name: "Manicoré",
        state: "",
        country: "BR",
        coord: {
          lon: -61.300282,
          lat: -5.80917,
        },
      },
      {
        id: 6254975,
        name: "Blairgowrie",
        state: "",
        country: "AU",
        coord: {
          lon: 144.779556,
          lat: -38.361309,
        },
      },
    ],
  }),
  created() {
    this.getWeather({
      lon: -60.025002,
      lat: -3.10194,
    });
  },
  methods: {
    convertTemprerature(temperature) {
      if (this.isFahrenheit == false) {
        return Math.round(temperature) + "º";
      } else {
        var fahrenheit = temperature * (9 / 5) + 32;
        return Math.round(fahrenheit) + "º";
      }
    },
    async getWeather(coords) {
      await fetch(
        "https://api.openweathermap.org/data/2.5/onecall?lat=" +
          coords.lat +
          "&lon=" +
          coords.lon +
          "&exclude=minutely&units=metric&lang=pt_br&appid=144504e9c967b134c9d26d1f7fdae9d0"
      )
        .then((res) => res.json())
        .then((res) => {
          this.weatherData = res;

          var countData = 0;
          var time = null,
            temperature = null;
          this.times = [];
          this.temperatures = [];

          while (countData < 10) {
            time = this.getHour(this.weatherData.hourly[countData].dt);
            time = time.toString();

            temperature = this.weatherData.hourly[countData].temp;

            time = time.length == 1 ? "0" + time : time;
            time += ":00";
            this.times.push(time);
            this.temperatures.push(temperature);

            countData++;
          }

          this.loadCity = false;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    goCity(direction) {
      if (direction == "left" && this.cityView > 0) {
        this.cityView--;
        this.getWeather(this.cities[this.cityView].coord);
        this.loadCity = true;
      }
      if (direction == "right" && this.cityView < this.cities.length - 1) {
        this.cityView++;
        this.getWeather(this.cities[this.cityView].coord);
        this.loadCity = true;
      }
    },
    getImage(infos) {
      var weatherIcon = infos.weather[0].id;

      if (
        infos.dt * 1000 >= infos.sunrise * 1000 &&
        infos.dt <= infos.sunset * 1000
      ) {
        return weatherMap.day[weatherIcon];
      } else {
        return weatherMap.nigth[weatherIcon];
      }
    },
    getDay(time) {
      var semana = [
        "Domingo",
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
      ];
      var day = new Date(time * 1000);

      return semana[day.getDay()];
    },
    getMonth(time) {
      var meses = [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "agosto",
        "outubro",
        "novembro",
        "dezembro",
      ];
      var day = new Date(time * 1000);

      return day.getDate() + ", " + meses[day.getMonth()];
    },
    getHour(time) {
      var date = new Date(time * 1000);

      return date.getHours();
    },
  },
  computed: {
    fields() {
      if (!this.model) return [];

      return Object.keys(this.model).map((key) => {
        return {
          key,
          value: this.model[key] || "n/a",
        };
      });
    },
    items() {
      return this.entries.map((entry) => {
        const Description =
          entry.Description.length > this.descriptionLimit
            ? entry.Description.slice(0, this.descriptionLimit) + "..."
            : entry.Description;

        return Object.assign({}, entry, { Description });
      });
    },
  },
};
</script>

<style lang="scss">
// Lado esquerdo
.left-side {
  position: relative;
  z-index: 1;
  height: 100%;
  .container:nth-child(1) {
    height: 100%;
  }
  .container .v-speed-dial {
    z-index: 20;
    top: 40px;
    right: 32px;
    .v-speed-dial__list {
      align-items: start;
    }
  }
}

.toggle {
  height: 40px;
  width: 80px;
  border: 1px solid #fff;
  border-radius: 20px;
  position: relative;
  display: flex;
  cursor: pointer;
  user-select: none;
  outline: none;
  z-index: 20;
  &::after {
    content: "";
    height: 32px;
    width: 32px;
    border-radius: 50%;
    background-color: #fff;
    position: absolute;
    top: 3px;
    left: 3px;
    transition: all 0.35s;
    z-index: 1;
  }
  &.active::after {
    left: 43px;
  }
  .toggle-side {
    color: #fff;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85em;
    position: relative;
    z-index: 2;
    transition: all 0.35s;
  }
}

.view {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: relative;
  z-index: 10;
  width: 100%;
  .view-temperature {
    background-image: linear-gradient(#fff6, #fff0);
    font-size: 6em;
    line-height: 90%;
    margin-bottom: -0.4em;
    font-weight: 600;
    width: auto;
    min-width: 50%;
    text-align: end;
    font-family: "Poppins", sans-serif;
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
  }
  .view-icon {
    width: auto;
    max-width: 300px;
    min-width: 150px;
    img {
      width: 100%;
    }
  }
}

.graphic {
  position: absolute;
  bottom: 0;
  left: 0;
  width: calc(100% + 24px);
  height: auto;
  z-index: 1;
  .graphic-chart {
    padding-right: 24px;
  }
  .graphic-time {
    min-height: 120px;
  }
}

//lado direito
.right-side {
  border-radius: 24px 0 0 24px !important;
  position: relative;
  z-index: 2;
  .container {
    height: 100vh;
  }
}

.header {
  h1 {
    color: #111111af;
    line-height: 100%;
    max-width: calc(100% - 72px);
  }
}

.list-load {
  height: calc(100vh - 172px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.list {
  overflow-y: auto;
  max-height: calc(100vh - 172px);
  .days {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .days-icon {
      width: 42px;
      height: 42px;
      background-image: linear-gradient(135deg, #1a1a1a4b, #d3d3d313);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      img {
        width: 75%;
      }
    }
    .days-temperature {
      font-weight: 500;
      font-family: "Poppins", sans-serif;
      font-size: 1.6em;
      line-height: 100%;
      color: #222222c9 !important;
    }
    .days-date {
      width: 40%;
      .days-date-day {
        font-weight: 600;
        font-size: 0.9em;
        line-height: 100%;
      }
      .days-date-mounth {
        font-weight: 300;
        font-size: 0.8em;
        line-height: 100%;
      }
    }
  }
}

// dialog
.v-dialog__content {
  align-items: start !important;
}
</style>
