import Heart from '@/components/common/Heart';
import Popover from '@/components/common/Popover';
import { GatheringListItem, GuestbookItem } from '@/types';
import getDatePart from '@/utils/getDatePart';
import Image from 'next/image';
import {
  NormalizedGathering,
  NormalizedGuestbook,
} from '../../../pages/guestBooks/utils/normalizeGuestbook';
import Link from 'next/link';
import { DEFAULT_IMAGE } from '@/constants/imgConfig';

interface GuestbookCardProps {
  guestbook: GuestbookItem | NormalizedGuestbook;
  gathering?: GatheringListItem | NormalizedGathering | null; // gathering이 없을 수도 있음
  showActions?: boolean; // showActions는 기본값이 false
  onEdit?: (guestbook: GuestbookItem) => void;
  onDelete?: (guestbook: GuestbookItem) => void;
}

export default function GuestbookCard({
  guestbook,
  gathering,
  showActions = false,
  onEdit,
  onDelete,
}: GuestbookCardProps) {
  // 이벤트 버블링 방지 핸들러
  const handlePopoverClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Link 이벤트 방지
    e.stopPropagation(); // 이벤트 버블링 방지
  };

  const gatheringLink =
    'gatheringId' in guestbook
      ? `/detail/${guestbook.gatheringId}`
      : `/detail/${gathering?.gatheringId}`;

  return (
    <Link href={gatheringLink}>
      <div className="flex flex-col lg:flex-row gap-[20px] lg:gap-[30px] bg-dark-900 rounded-lg">
        {/* 이미지 영역 */}
        <div className="relative min-w-[343px] md:min-w-[696px] lg:min-w-[300px] h-[200px] rounded-[20px] overflow-hidden">
          <Image
            src={
              !gathering?.imageUrl || gathering.imageUrl === 'null'
                ? DEFAULT_IMAGE
                : gathering.imageUrl
            }
            alt={gathering?.title || '모임 이미지'}
            layout="fill"
            className="object-cover cursor-pointer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = DEFAULT_IMAGE;
            }}
          />
        </div>

        <div className="flex-1 min-w-[343px] md:min-w-[696px] lg:w-[300px] h-[200px] px-2 lg:px-0 lg:py-6 lg:pr-6">
          <div className="flex flex-col h-full">
            {/* flex container 추가 */}
            <div className="flex justify-between items-start mb-4">
              <Heart rating={guestbook.rating} type="guestbook" />
              {showActions &&
                onEdit &&
                onDelete &&
                'gatheringId' in guestbook && (
                  <div onClick={handlePopoverClick}>
                    <Popover
                      type="dot"
                      items={[
                        {
                          id: 'edit',
                          label: '수정하기',
                          onClick: () => onEdit(guestbook),
                        },
                        {
                          id: 'delete',
                          label: '삭제하기',
                          onClick: () => onDelete(guestbook),
                        },
                      ]}
                    />
                  </div>
                )}
            </div>
            <p className="mb-2 lg:mb-4 break-all line-clamp-4">
              {guestbook.content}
            </p>
            <div className="mt-auto pb-1">
              {gathering && (
                <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between">
                  <p className="text-primary font-normal truncate flex-1 min-w-0">
                    {gathering.title} | {gathering.mainLocation}{' '}
                    {gathering.subLocation}
                  </p>
                  <p className="text-dark-700 font-medium whitespace-nowrap">
                    {getDatePart(guestbook.createdAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
