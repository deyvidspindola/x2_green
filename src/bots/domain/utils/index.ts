export const _getChatData = (ctx: any) => {
  return {
    chat_id: ctx.chat?.id.toString(),
    first_name: ctx.chat?.first_name,
    last_name: ctx.chat?.last_name,
    username: ctx.chat?.username,
    name: `<b>${ctx.chat?.first_name} ${ctx.chat?.last_name}</b>`,
  };
};
