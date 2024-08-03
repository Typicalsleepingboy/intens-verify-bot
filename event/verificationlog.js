const Verification = require('../models/verification');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;

        await interaction.deferUpdate(); // This ensures the interaction is acknowledged

        // Extract the action and userId from the customId
        const [action, userId] = interaction.customId.split('-');

        // Fetch verification data
        const verificationData = await Verification.findOne({ discordId: userId });

        if (!verificationData) {
            console.error(`Verification data not found for user ${userId}`);
            await interaction.followUp({ content: 'Verification data not available at this time.', ephemeral: true });
            return;
        }

        try {
            const logChannelId = '1269106033482272912'; // Ganti dengan ID saluran log Anda
            const logChannel = interaction.guild.channels.cache.get(logChannelId);

            if (!logChannel) {
                console.error(`Log channel not found with ID ${logChannelId}`);
                await interaction.followUp({ content: 'Log channel not available at this time.', ephemeral: true });
                return;
            }

            if (action === 'approve') {
                // Ensure the user is an admin
                if (!interaction.member.roles.cache.some(role => role.name === 'Admin')) {
                    await interaction.followUp({ content: 'Anda tidak memiliki hak akses untuk melakukan aksi ini.', ephemeral: true });
                    return;
                }

                const member = await interaction.guild.members.fetch(userId);
                const role = interaction.guild.roles.cache.find(r => r.name === 'Verified');

                if (role) {
                    await member.roles.add(role);

                    // Embed for approval
                    const approvalEmbed = new EmbedBuilder()
                        .setAuthor({ name: 'Data verifikasi diterima', iconURL: 'https://cdn.discordapp.com/attachments/1185883650269650958/1255551133364261036/hit.png?ex=667d8a9d&is=667c391d&hm=b36fa4f363cdf2a91431e35a983694471516044cf20e92aa179eb78dcf2c8cb4&' })
                        .setDescription(`**yesss, Data user ID <@${userId}> telah disetujui oleh admin dan telah diberi role "Verified".**`)
                        .setImage('https://media.discordapp.net/attachments/1039127984289886238/1049939123512823878/source-1.gif?ex=66ae7a41&is=66ad28c1&hm=11a9bdbff624b26643e107390831c9737f857bb0bff8684c57e8ce71eca42f7d&')
                        .setColor('#9883ff')
                        .setTimestamp();
                    const messageContent = `## Anda telah sukses diverifikasi <@${userId}>`;
                    await logChannel.send({ embeds: [approvalEmbed], content: messageContent, });
                    await interaction.followUp({ content: 'User berhasil di approved dan datanya sudah dikirim ke verify status', ephemeral: true });
                }
            } else if (action === 'reject') {
                // Ensure the user is an admin
                if (!interaction.member.roles.cache.some(role => role.name === 'Admin')) {
                    await interaction.followUp({ content: 'Anda tidak memiliki hak akses untuk melakukan aksi ini.', ephemeral: true });
                    return;
                }

                // Embed for rejection
                const rejectionEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Data verifikasi ditolak', iconURL: 'https://cdn.discordapp.com/attachments/1185883650269650958/1255560643998650499/alert.png?ex=667d9378&is=667c41f8&hm=1a23f88900044466fb12229414b54018641ca1e377d8fdac4a6af45b2992a523&' })
                    .setDescription(`**ohhh tidak, Data verifikasi user ID <@${userId}> telah ditolak oleh admin. Harap tinjau kiriman Anda dan coba lagi.**`)
                    .setImage('https://media.discordapp.net/attachments/1039127984289886238/1049939123512823878/source-1.gif?ex=66ae7a41&is=66ad28c1&hm=11a9bdbff624b26643e107390831c9737f857bb0bff8684c57e8ce71eca42f7d&')
                    .setColor('#4c3c70')
                    .setTimestamp();

                const messageContent = `## Mohon maaf data yang anda kirim belum sesuai <@${userId}>`;
                await logChannel.send({ embeds: [rejectionEmbed], content: messageContent, });
                await interaction.followUp({ content: 'User ini berhasil di tolak di dan datanya sudah dikirim ke verify status', ephemeral: true });
            }
        } catch (error) {
            console.error('Interaction handling error:', error);
            await interaction.followUp({ content: 'An error occurred while processing the interaction.', ephemeral: true });
        }
    }
};
