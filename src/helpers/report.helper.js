export const sortGameReportsPerRelevance = (reports) => {
      if (!reports || reports.length === 0) return reports

      // Separate reports by source
      const steamdeckhqReports = reports.filter(r => r.source === 'steamdeckhq')
      const sharedeckReports = reports.filter(r => r.source === 'sharedeck')
      const protondbReports = reports.filter(r => r.source === 'protondb')

      // Sort ProtonDB by date (newest first)
      protondbReports.sort((a, b) => {
        const dateA = a.posted_at ? new Date(a.posted_at) : new Date(0)
        const dateB = b.posted_at ? new Date(b.posted_at) : new Date(0)
        return dateB - dateA
      })

      // Get first sharedeck post
      const firstSharedeck = sharedeckReports.length > 0 ? [sharedeckReports[0]] : []
      
      // Find first sharedeck post with different hardware
      let secondSharedeck = []
      if (sharedeckReports.length > 1) {
        const firstHardware = sharedeckReports[0]?.steamdeck_hardware
        const differentHardwarePost = sharedeckReports.slice(1).find(
          r => r.steamdeck_hardware && r.steamdeck_hardware !== firstHardware
        )
        if (differentHardwarePost) {
          secondSharedeck = [differentHardwarePost]
        }
      }

      // Get remaining sharedeck posts (excluding first and second if they exist)
      const remainingSharedeck = sharedeckReports.filter(
        r => r !== firstSharedeck[0] && r !== secondSharedeck[0]
      )

      

      // Interleave shuffled sharedeck posts between protondb posts
      const interleavedPosts = []
      const maxLength = Math.max(protondbReports.length, remainingSharedeck.length)
      
      for (let i = 0; i < maxLength; i++) {
        if (i < protondbReports.length) {
          interleavedPosts.push(protondbReports[i])
        }
        if (i < remainingSharedeck.length) {
          interleavedPosts.push(remainingSharedeck[i])
        }
      }

      // Final order: steamdeckhq -> first sharedeck -> second sharedeck (diff hardware) -> interleaved posts
      return [
        ...steamdeckhqReports,
        ...firstSharedeck,
        ...secondSharedeck,
        ...interleavedPosts,
      ]
    }