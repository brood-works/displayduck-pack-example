import { signal, type Signal, type WidgetContext } from '@displayduck/base';

export class DisplayDuckWidget {
  public showConfig: Signal<boolean>;
  public config: Signal<Record<string, unknown>>;

  public constructor(private readonly ctx: WidgetContext) {
    this.config = signal(ctx.payload ?? {});
    this.showConfig = signal(false);
  }

  public onInit(): void {
    this.ctx.on('click', '#btn', () => {
      this.showConfig.set(!this.showConfig());
    });
  }

  public onDestroy(): void {
    // Optional cleanup hook.
  }
}
