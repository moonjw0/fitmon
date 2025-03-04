import Button from '@/components/common/Button';
import { GatheringListItem } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import getDatePart from '@/utils/getDatePart';
import { DEFAULT_IMAGE } from '@/constants/imgConfig';

interface AvailableGuestbooksProps {
  gatherings: GatheringListItem[];
  onWriteClick: (gatheringId: number) => void;
  isLoading?: boolean;
}

export default function AvailableGuestbooks({
  gatherings,
  onWriteClick,
}: AvailableGuestbooksProps) {
  const handleButtonClick = (e: React.MouseEvent, gatheringId: number) => {
    e.preventDefault(); // Link 이벤트 방지
    e.stopPropagation(); // 이벤트 버블링 방지
    onWriteClick(gatheringId);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {gatherings.map((gathering) => (
        <Link
          key={gathering.gatheringId}
          href={`/detail/${gathering.gatheringId}`}
          className="block" 
        >

          <div className="flex flex-col justify-center md:justify-start md:flex-row md:w-[696px] lg:w-[906px] md:h-[200px] gap-6 md:gap-8 lg:gap-10">
            <div className="relative w-full md:w-[228px] lg:w-[300px] h-[150px] sm:h-[200px] overflow-hidden rounded-[20px]">
              <Image
                src={gathering.imageUrl || DEFAULT_IMAGE}
                alt={gathering.title}
                width={300}
                height={200}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'DEFAULT_IMAGE';
                }}
              />
            </div>

            <div className="flex flex-col flex-1 px-1 md:px-0 py-1 lg:py-5">
              <h3 className="text-primary text-xs md:text-base font-normal mb-2.5 md:mb-3.5">
                {gathering.subType} | {gathering.mainLocation} {gathering.subLocation}
              </h3>
              <h2 className="text-sm md:text-xl font-bold mb-3.5">
                {gathering.title}
              </h2>
              <div className="flex text-xs md:text-base items-center gap-[13px] text-dark-700 mb-2.5 sm:mb-[15px] lg:mb-5">
                <h4>
                  {getDatePart(gathering.startDate)} ~{' '}
                  {getDatePart(gathering.endDate)}
                </h4>
                <div className="flex items-center font-normal gap-2 text-white">
                  <Image
                    src="/assets/image/person.svg"
                    alt="참여자 아이콘"
                    width={18}
                    height={18}
                    className="w-4 h-4 md:w-[18px] md:h-[18px]"
                  />
                  <span>
                    {gathering.participantCount}/{gathering.totalCount}
                  </span>
                </div>
              </div>
              <div
                className="w-[122px] h-8 md:w-[163px] md:h-[43px]"
                onClick={(e) => handleButtonClick(e, gathering.gatheringId)}
              >
                <Button
                  name="방명록 작성하기"
                  style="custom"
                  className="w-[122px] h-8 md:w-[163px] md:h-[43px] text-sm md:text-base"
                  handleButtonClick={() => { }}
                />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}