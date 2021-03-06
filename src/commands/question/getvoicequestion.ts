import { json_embed } from "../../discord_utils/embeds";
import { Message, MessageCollector, StreamDispatcher } from "discord.js";
import { my_client, command_parsed_output } from "../../types";
const Discord = require("discord.js");
const discordTTS = require("discord-tts");
import { get_question, async_collection, check_answer } from "../../methods";
function async_dispatcher(
  dispatcher: StreamDispatcher,
  event: string
): Promise<void> {
  return new Promise((resolve, _) => {
    dispatcher.on(event, () => resolve());
  });
}
export default {
  description: "Get a random question",
  alias: new Set(["vq", "nvq"]),
  sample_usage: "getvoicequestion",
  run: async (
    command_parsed: command_parsed_output,
    msg: Message,
    client: my_client
  ) => {
    const question = await get_question();
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) {
      return "you must be in a voice channel to use this command";
    }
    const connection = await voiceChannel.join();
    const stream = discordTTS.getVoiceStream(question.tossup_question);
    const dispatcher = connection.play(stream);
    await async_dispatcher(dispatcher, "finish");
    const response = await async_collection(
      msg,
      (m: Message) => check_answer(question.tossup_answer, m.content),
      (m: Message) => m.author.id === msg.author.id
    );
    if (response.success) {
      return "sucess you are correct";
    } else {
      return `no, the correct answer was ${question.tossup_answer}`;
    }
  },
};
