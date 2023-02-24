// type TPaginationType = "foo" | "bar"

// interface IAwesomeProps<TPagination extends TPaginationType> {
//   pagination: TPagination extends "foo" ? PaginationFoo : PaginationBar
// }

// class PaginationFoo {
//   foo = ""

//   get params() {
//     return { foo: this.foo }
//   }
// }

// class PaginationBar {
//   bar = ""

//   get params() {
//     return { bar: this.bar }
//   }
// }

// class Awesome<TPagination extends "foo" | "bar"> {
//   constructor(props: IAwesomeProps<TPagination>) {
//     console.log(props)
//   }

//   someFn = (arg: TPagination extends "foo" ? { foo: string } : { bar: string }) => {
//     if ("foo" in arg) {
//       console.log(arg.foo)
//     } else {
//       console.log(arg.bar)
//     }
//   }
// }

// const awesome = new Awesome<"foo">({
//   pagination: new PaginationFoo(),
// })

// awesome.someFn("foo")
