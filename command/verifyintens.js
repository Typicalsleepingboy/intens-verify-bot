const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const Verification = require('../models/verification');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifyintens')
    .setDescription('Submit your social media verification')
    .addStringOption(option =>
      option.setName('instagram')
        .setDescription('Your Instagram username')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('twitter')
        .setDescription('Your Twitter username')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('tiktok')
        .setDescription('Your TikTok username')
        .setRequired(true))
    .addAttachmentOption(option =>
      option.setName('screenshot_instagram')
        .setDescription('Screenshot of your Instagram profile')
        .setRequired(true))
    .addAttachmentOption(option =>
      option.setName('screenshot_twitter')
        .setDescription('Screenshot of your Twitter profile')
        .setRequired(true))
    .addAttachmentOption(option =>
      option.setName('screenshot_youtube')
        .setDescription('Screenshot of your YouTube profile')
        .setRequired(true))
    .addAttachmentOption(option =>
      option.setName('screenshot_tiktok')
        .setDescription('Screenshot of your TikTok profile')
        .setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const instagram = interaction.options.getString('instagram');
    const twitter = interaction.options.getString('twitter');
    const tiktok = interaction.options.getString('tiktok');
    const screenshotInstagram = interaction.options.getAttachment('screenshot_instagram');
    const screenshotTwitter = interaction.options.getAttachment('screenshot_twitter');
    const screenshotTiktok = interaction.options.getAttachment('screenshot_tiktok');
    const screenshotYoutube = interaction.options.getAttachment('screenshot_youtube');

    if (!instagram || !twitter || !tiktok || !screenshotInstagram || !screenshotTwitter || !screenshotTiktok || !screenshotYoutube) {
      await interaction.followUp({ content: 'All fields are required!', ephemeral: false });
      return;
    }

    const uuid = uuidv4();

    const verificationData = new Verification({
      discordId: interaction.user.id,
      discordUsername: interaction.user.username,
      instagram,
      twitter,
      tiktok,
      uuid,
      screenshotInstagram: screenshotInstagram.url,
      screenshotTwitter: screenshotTwitter.url,
      screenshotTiktok: screenshotTiktok.url,
      screenshotYoutube: screenshotYoutube.url,
      date: new Date()
    });

    await verificationData.save();

    const logChannel = interaction.client.channels.cache.get('1269056250403094600'); // Replace with your log channel ID
    const logEmbed = new EmbedBuilder()
      .setTitle('New Verification Submission')
      .setColor('#9883ff')
      .addFields(
        { name: 'Discord Username', value: verificationData.discordUsername, inline: true },
        { name: 'Discord ID', value: verificationData.discordId, inline: true },
        { name: 'Instagram', value: verificationData.instagram, inline: true },
        { name: 'Twitter', value: verificationData.twitter, inline: true },
        { name: 'TikTok', value: verificationData.tiktok, inline: true },
        { name: 'UUID', value: verificationData.uuid, inline: true },
        { name: 'Date', value: verificationData.date.toISOString(), inline: true },
        { name: 'Screenshots', value: `[Instagram](${verificationData.screenshotInstagram}), [Twitter](${verificationData.screenshotTwitter}), [TikTok](${verificationData.screenshotTiktok}), [YouTube](${verificationData.screenshotYoutube})`, inline: true }
      )
      .setFooter({ text: 'Verification System' })
      .setTimestamp();

    const approveButton = new ButtonBuilder()
      .setCustomId(`approve-${verificationData.discordId}`)
      .setLabel('✔️ Approve') // Emoji or text label
      .setStyle(ButtonStyle.Success);

    const rejectButton = new ButtonBuilder()
      .setCustomId(`reject-${verificationData.discordId}`)
      .setLabel('❌ Reject') // Emoji or text label
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(approveButton, rejectButton);
    const instagramAttachment = new AttachmentBuilder(screenshotInstagram.url, { name: 'instagram_screenshot.png' });
    const twitterAttachment = new AttachmentBuilder(screenshotTwitter.url, { name: 'twitter_screenshot.png' });
    const tiktokAttachment = new AttachmentBuilder(screenshotTiktok.url, { name: 'tiktok_screenshot.png' });
    const youtubeAttachment = new AttachmentBuilder(screenshotYoutube.url, { name: 'youtube_screenshot.png' });
    const messageContent = `## woiii ada yang mau periv tuhhh @everyone`;
    await logChannel.send({
      embeds: [logEmbed], files: [instagramAttachment, twitterAttachment, tiktokAttachment, youtubeAttachment],
      components: [row], content: messageContent,
    });

    const responseEmbed = new EmbedBuilder()
      .setDescription('✅・Data verifikasi kamu sudah terkirim. Mohon tunggu proses selanjutnya.\n🧾・Silahkan lihat proses verifikasi di channel <#1269106033482272912> datanya dimana masuk nanti.')
      .setColor('#9883ff');

    await interaction.followUp({ embeds: [responseEmbed], ephemeral: false });
  }
};
