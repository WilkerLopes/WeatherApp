import Vue from "vue";
import Vuetify from "vuetify/lib/framework";
import pt from "vuetify/lib/locale/pt";

Vue.use(Vuetify);

const Light = {
  primary: "#0B57C6",
  secondary: "#0038B6",
  background: "#ffffff",
  white: "#ffffff",
};

export default new Vuetify({
  lang: {
    locales: { pt },
    current: "pt",
  },
  icons: {
    iconfont: "fa",
  },
  theme: {
    options: {
      customProperties: true,
    },
    themes: {
      light: Light,
    },
  },
});
