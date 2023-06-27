declare module '*.vue' {
    import { defineComponent } from 'vue';
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Component: ReturnType<typeof defineComponent>;
    // eslint-disable-next-line import/no-default-export
    export default Component;
}
