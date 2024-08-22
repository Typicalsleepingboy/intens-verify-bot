const Verification = require('../models/verification');
const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const allowedRoleIDs = ['1185883650252881969', '1185883650252881968', '1193421102194626590', '1188765074987429888', '1185883650269650956'];

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        const [action, userId] = interaction.customId.split('-');

        // Check if the user has one of the allowed roles
        const hasAllowedRole = interaction.member.roles.cache.some(role => allowedRoleIDs.includes(role.id));
        if (!hasAllowedRole) {
            await interaction.reply({ content: 'You do not have permission to perform this action.', ephemeral: true });
            return;
        }

        if (action === 'reject') {
            const modal = new ModalBuilder()
                .setCustomId(`reject-modal-${userId}`)
                .setTitle('Rejection Reason');

            const rejectionReasonInput = new TextInputBuilder()
                .setCustomId('rejectionReason')
                .setLabel('Please provide a reason for rejection')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Type your reason here...')
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder().addComponents(rejectionReasonInput);
            modal.addComponents(firstActionRow);
            await interaction.showModal(modal);
        } else if (action === 'approve') {
            await interaction.deferUpdate(); 

            try {
                const verificationData = await Verification.findOne({ discordId: userId });

                if (!verificationData) {
                    console.error(`Verification data not found for user ${userId}`);
                    await interaction.editReply({ content: 'Verification data not available at this time.', ephemeral: true });
                    return;
                }

                const logChannelId = '1269707778986086430'; 
                const logChannel = interaction.guild.channels.cache.get(logChannelId);

                if (!logChannel) {
                    console.error(`Log channel not found with ID ${logChannelId}`);
                    await interaction.editReply({ content: 'Log channel not available at this time.', ephemeral: true });
                    return;
                }

                const member = await interaction.guild.members.fetch(userId);
                const role = interaction.guild.roles.cache.find(r => r.name === 'Verified');

                if (role) {
                    await member.roles.add(role);

                    // Embed for approval
                    const approvalEmbed = new EmbedBuilder()
                        .setAuthor({ name: 'Data verifikasi diterima', iconURL: 'https://cdn.discordapp.com/attachments/1185883650269650958/1255551133364261036/hit.png?ex=667d8a9d&is=667c391d&hm=b36fa4f363cdf2a91431e35a983694471516044cf20e92aa179eb78dcf2c8cb4&' })
                        .setDescription(`**yesss, Data user ID <@${userId}> telah disetujui oleh admin <@${interaction.user.id}> dan telah diberi role "Verified".**`)
                        .setImage('https://media.discordapp.net/attachments/1039127984289886238/1049939123512823878/source-1.gif?ex=66ae7a41&is=66ad28c1&hm=11a9bdbff624b26643e107390831c9737f857bb0bff8684c57e8ce71eca42f7d&')
                        .setThumbnail('https://media.discordapp.net/attachments/1189553700369342504/1270972340079169608/20240808_120822.png?ex=66b5a4bb&is=66b4533b&hm=280e27c31ddcec34e23b7383f01670f60aa39e5a310fb81a3e05707934d1db3e&=&format=webp&quality=lossless&width=700&height=700')
                        .setColor('#9883ff')
                        .setTimestamp()
                        .setFooter({ text: `Approved by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

                    const messageContent = `**Anda telah sukses diverifikasi <@${userId}>**`;
                    await logChannel.send({ embeds: [approvalEmbed], content: messageContent });
                    await interaction.followUp({ content: 'User berhasil di approved dan datanya sudah dikirim ke verify status', ephemeral: true });

                    // Disable the buttons
                    const approveButton = new ButtonBuilder()
                        .setCustomId(`approve-${verificationData.discordId}`)
                        .setLabel('✔️ Approve')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true);

                    const rejectButton = new ButtonBuilder()
                        .setCustomId(`reject-${verificationData.discordId}`)
                        .setLabel('❌ Reject')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true);

                    const row = new ActionRowBuilder().addComponents(approveButton, rejectButton);
                    await interaction.message.edit({ components: [row] });
                }
            } catch (error) {
                console.error('Interaction handling error:', error);
                await interaction.editReply({ content: 'An error occurred while processing the interaction.', ephemeral: true });
            }
        }
    },
};
