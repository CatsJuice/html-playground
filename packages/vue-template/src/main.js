const {
  h,
  createApp,
  defineComponent,
} = Vue;

const Greet = defineComponent({
  props: { msg: String },
  setup() {},
  template: `<h2>Hello, {{ msg }} !</h2>`,
})

createApp({
  setup() {
    return () => h(
      "div",
      null,
      [
        h(Greet, { msg: "World" }),
        h(Greet, { msg: "Vue 3" }),
      ]
    )
  },
}).mount("#app");
