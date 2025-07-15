'use client'

import { getAllMedia } from '@/service/media'
import { Media } from '@/type/type'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const Series = () => {
  const [seriesList, setSeriesList] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await getAllMedia()
        const allMedia = response?.data?.data
        if (Array.isArray(allMedia)) {
          const onlySeries = allMedia.filter(
            media => media.type?.toLowerCase() === 'series'
          )
          setSeriesList(onlySeries)
        }
      } catch (error) {
        // console.error('Error fetching media:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [])

  const handleBuyNow = (mediaId: string) => {
    router.push(`/checkout/${mediaId}`)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
      {seriesList.length > 0 ? (
        seriesList.map(series => (
          <motion.div
            key={series.id}
            className="p-4 shadow-lg rounded bg-white"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={
                typeof series.thumbnail === 'string' && series.thumbnail !== ''
                  ? series.thumbnail
                  : '/default-thumbnail.jpg' // optional fallback
              }
              alt={series.title}
              className="w-full h-48 object-cover rounded-2xl"
            />
            <h2 className="text-xl font-semibold mt-2">{series.title}</h2>
            <p className="text-gray-600">{series.genre}</p>
            <p className="text-sm text-gray-500">{series.releaseDate}</p>

            <button
              className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              onClick={() => handleBuyNow(series.id)}
            >
              Buy Now - ${series.amount}
            </button>
          </motion.div>
        ))
      ) : (
        <p>No Series found.</p>
      )}
    </div>
  )
}

export default Series
