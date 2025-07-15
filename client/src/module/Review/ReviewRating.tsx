"use client"
import { Table } from '@/components/core/Table';
import { getALLReview } from '@/service/review';
import { IReview } from '@/type/type';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';



const columns: ColumnDef<IReview>[] = [
  { accessorKey: 'media.title', header: 'Media Title', cell: info => info.getValue() },
  { accessorKey: 'user.name', header: 'User Name', cell: info => info.getValue() },
  { accessorKey: 'user.email', header: 'User Email', cell: info => info.getValue() },
  {accessorKey:'Rating', header:'Rating', cell:info=>info.getValue()},
  
  { accessorKey: 'comment', header: 'Comment', cell: info => info.getValue() },
  {
    accessorKey: 'createdAt',
    header: 'Reviewed On',
    cell: info =>
      new Date(info.getValue() as string).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
  },
];

export default function ReviewRating() {

    const [reviews, setReviews] = useState<IReview[]>([])

    useEffect(() => {
        const fetchReviews = async () => {
            const data = await getALLReview()
            setReviews(data)
        }
        fetchReviews()
    }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">All Reviews</h2>
      <Table data={reviews} columns={columns} />
    </div>
  );
}
