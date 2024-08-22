const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.guild || !interaction.isModalSubmit()) return;
    const customIdParts = interaction.customId.split('-');
    const action = customIdParts.slice(0, 2).join('-'); 
    const userId = customIdParts.slice(2).join('-'); 

    if (action !== 'reject-modal') {
      return;
    }

    try {
      await interaction.deferReply({ ephemeral: true });

      const rejectionReason = interaction.fields.getTextInputValue('rejectionReason');

      const logChannelId = '1269106033482272912'; 
      const logChannel = interaction.guild.channels.cache.get(logChannelId);

      if (!logChannel) {
        console.error(`Log channel not found with ID ${logChannelId}`);
        await interaction.followUp({ content: 'Log channel not available at this time.', ephemeral: true });
        return;
      }

      // Embed for rejection
      const rejectionEmbed = new EmbedBuilder()
        .setAuthor({ name: 'Data verifikasi ditolak', iconURL: 'https://cdn.discordapp.com/attachments/1185883650269650958/1255560643998650499/alert.png?ex=667d9378&is=667c41f8&hm=1a23f88900044466fb12229414b54018641ca1e377d8fdac4a6af45b2992a523&' })
        .setDescription(`**ohhh tidak, Data verifikasi user ID <@${userId}> telah ditolak oleh admin <@${interaction.user.id}> Harap tinjau kiriman Anda dan coba lagi.**`)
        .setImage('https://media.discordapp.net/attachments/1039127984289886238/1049939123512823878/source-1.gif?ex=66ae7a41&is=66ad28c1&hm=11a9bdbff624b26643e107390831c9737f857bb0bff8684c57e8ce71eca42f7d&')
        .setThumbnail('https://media.discordapp.net/attachments/1189553700369342504/1270972339105955912/20240808_120742.png?ex=66b5a4bb&is=66b4533b&hm=bde88e5f7e36fc8570387ab96f04eee24b962925780b60e626f82ad9396fe59b&=&format=webp&quality=lossless&width=700&height=700')
        .setColor('#9883ff')
        .addFields({ name: '**⚠️ Alasan ditolak**', value: `\`\`\`${rejectionReason}\`\`\``})
        .setTimestamp()
        .setFooter({ text: `Rejected by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

      const messageContent = `**Mohon maaf data yang anda kirim belum sesuai <@${userId}>**`;
      await logChannel.send({ embeds: [rejectionEmbed], content: messageContent });

      await interaction.followUp({ content: 'User ini berhasil di tolak dan datanya sudah dikirim ke verify status', ephemeral: true });

    } catch (error) {
      console.error('Modal submission handling error:', error);
      try {
        await interaction.followUp({ content: 'An error occurred while processing the modal submission.', ephemeral: true });
      } catch (followUpError) {
        console.error('Follow-up error:', followUpError);
      }
    }
  },
};
