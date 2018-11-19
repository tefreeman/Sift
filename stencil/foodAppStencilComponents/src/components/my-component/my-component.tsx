import { Component, Prop, State } from '@stencil/core';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true
})
export class MyComponent {
  timer: number;
  @Prop() first: string;
  @Prop() middle: string;
  @Prop() last: string;

  @State() time: number = Date.now();

  componentDidLoad() {
    this.timer = window.setInterval(() => {
      this.time = Date.now();
    }, 1000);
  }
  componentDidUnload() {
    window.clearInterval(this.timer);
  }

  format(): string {
    return (
      (this.first || '') +
      (this.middle ? ` ${this.middle}` : '') +
      (this.last ? ` ${this.last}` : '')
    );
  }

  render() {
    const time = new Date(this.time).toLocaleTimeString();

    return (
    <div>
      Hello, World! I'm {this.format()}
      <span>{ time }</span>
    </div>);
  }
}
