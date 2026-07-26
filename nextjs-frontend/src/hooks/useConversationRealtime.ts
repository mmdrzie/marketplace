'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useConversationRealtime(conversationId: number | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel: RealtimeChannel = supabase.channel(`conversation:${conversationId}`);

    channel
      .on('broadcast', { event: 'message.sent' }, () => {
        queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      })
      .on('broadcast', { event: 'conversation.started' }, () => {
        queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, queryClient]);
}
