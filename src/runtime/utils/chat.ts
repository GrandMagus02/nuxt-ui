import type { ComputedRef, InjectionKey } from 'vue'

// Whether a submit from `UChatPrompt` would be queued right now, so `UChatPromptSubmit` sends instead of stopping
export const chatPromptQueueingInjectionKey: InjectionKey<ComputedRef<boolean>> = Symbol('nuxt-ui.chat-prompt-queueing')

export interface ChatMessageContext {
  color?: string
  variant?: string
  compact?: boolean
}

// The style of the enclosing `UChatMessage`, so content like `UChatAudio` matches its bubble
export const chatMessageInjectionKey: InjectionKey<ComputedRef<ChatMessageContext>> = Symbol('nuxt-ui.chat-message')
