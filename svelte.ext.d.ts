/// <reference types="svelte2tsx/svelte-jsx" />

declare namespace svelte.JSX {
    interface HTMLProps<T> extends HTMLAttributes<T> {
        exact?: boolean
    }
}
