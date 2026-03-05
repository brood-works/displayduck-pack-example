import { signal, type Signal, type WidgetContext } from '@displayduck/plugin-framework';
import Handlebars from "handlebars"

Handlebars.registerHelper("json", function (context: any) {
  return JSON.stringify(context)
})

export class Widget {
  public title: Signal<string>;
  public message: Signal<string>;
  public showMessage: Signal<boolean>;
  public items: Signal<string[]>;
  public config: Signal<Record<string, unknown>>;

  public constructor(private readonly ctx: WidgetContext) {
    const payloadTitle = typeof ctx.payload?.title === 'string' ? ctx.payload.title : 'Example Widget';
    this.config = ctx.payload ?? {};
    this.title = signal(payloadTitle);
    this.message = signal('Hello from pluginny!');
    this.showMessage = signal(false);
    this.items = signal(['Swords', 'Shield', 'Potionzzs']);
    this.config = signal(this.config);
  }

  public onInit(): void {
    this.ctx.on('click', '#btn', () => {
      this.showMessage.set(!this.showMessage());
    });
  }

  public onUpdate(payload: Record<string, unknown>): void {
    if (typeof payload?.title === 'string' && payload.title.trim().length > 0) {
      this.title.set(payload.title.trim());
    }
  }

  public onDestroy(): void {
    // Optional cleanup hook.
  }
}
