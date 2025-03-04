import {
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { GatheringQueries } from './gatheringQueries';
import {
  ChallengeType,
  GatheringDetailType,
  GatheringStateType,
} from '@/types';
import {
  ChallengeCreateRequest,
  GatheringUpdateRequest,
} from '../dto/requestDto';
import { deleteGathering, updateGathering } from '../api/gatheringApi';
import {
  createChallenge,
  deleteChallenge,
  fetchAllChallengesByGatheringId,
  verificationChallenge,
} from '../api/challengeApi';

export const queryKeys = {
  gathering: (gatheringId: number) => [`gathering`, gatheringId],
  gatheringStatus: (gatheringId: number) => [`gatheringStatus`, gatheringId],
  gatheringChallenges: (gatheringId: number, status: string) => [
    'gatheringChallenges',
    gatheringId,
    status,
  ],
  gatheringGuestbooks: (gatheringId: number, page: number) => [
    'gatheringGuestbooks',
    gatheringId,
    page,
  ],
  gatheringCalendar: (gatheringId: number) => [
    'gatheringCalendar',
    gatheringId,
  ],
};

export const useGatheringDetail = (gatheringId: number) => {
  const queryOptions = GatheringQueries.getGatheringQuery(gatheringId);
  return useQuery(queryOptions);
};

export const useGatheringStatus = (gatheringId: number) => {
  const queryOptions = GatheringQueries.getGatheringStatusQuery(gatheringId);
  return useQuery(queryOptions);
};

export const useGatheringChallenges = (gatheringId: number, status: string) => {
  const queryOptions = GatheringQueries.getGatheringChallengesQuery(
    gatheringId,
    status,
  );
  return useInfiniteQuery(queryOptions);
};

export const useGatheringGuestbooks = (gatheringId: number, page: number) => {
  const queryOptions = GatheringQueries.getGatheringGuestbooksQuery(
    gatheringId,
    page,
  );
  return useQuery(queryOptions);
};

interface GatheringUpdateRequestType {
  newGathering: GatheringUpdateRequest;
}
export const useGatheringUpdate = (
  gatheringId: number,
  queryClient: QueryClient,
) => {
  return useMutation<GatheringDetailType, Error, GatheringUpdateRequestType>({
    mutationFn: ({ newGathering }: GatheringUpdateRequestType) =>
      updateGathering(newGathering, gatheringId),
    onMutate: async ({ newGathering }: GatheringUpdateRequestType) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.gathering(gatheringId),
      });

      await queryClient.cancelQueries({
        queryKey: queryKeys.gatheringStatus(gatheringId),
      });

      const previousGathering = queryClient.getQueryData<GatheringDetailType>(
        queryKeys.gathering(gatheringId),
      );

      const previousGatheringStatus =
        queryClient.getQueryData<GatheringStateType>(
          queryKeys.gatheringStatus(gatheringId),
        );

      if (previousGathering) {
        queryClient.setQueryData<GatheringDetailType>(
          queryKeys.gathering(gatheringId),
          {
            ...previousGathering,
            ...newGathering,
          },
        );
      }

      if (previousGatheringStatus) {
        queryClient.setQueryData<GatheringStateType>(
          queryKeys.gatheringStatus(gatheringId),
          {
            ...previousGatheringStatus,
            totalCount: newGathering.totalCount,
          },
        );
      }

      return { previousGathering, previousGatheringStatus };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gathering(gatheringId),
      });
    },

    onError: (error: Error) => {
      console.error(error);
    },
  });
};

export const useChallengeCreate = (
  gatheringId: number,
  queryClient: QueryClient,
) => {
  return useMutation({
    mutationFn: async (newChallenge: ChallengeCreateRequest) => {
      createChallenge(newChallenge, gatheringId);
    },
    onMutate: async (newChallenge: ChallengeCreateRequest) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.gatheringChallenges(gatheringId, 'IN_PROGRESS'),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const previousGatheringChallenges: any = queryClient.getQueryData(
        queryKeys.gatheringChallenges(gatheringId, 'IN_PROGRESS'),
      )!;

      const challenge = {
        gatheringId: 0,
        challengeId: 0,
        participantCount: 0,
        successParticipantCount: 0,
        participantStatus: false,
        verificationStatus: false,
        ...newChallenge,
      };

      const newChallenges = {
        ...previousGatheringChallenges,
        pages: [
          {
            content: [
              challenge,
              ...previousGatheringChallenges.pages[0].content,
            ],
            hasNext: previousGatheringChallenges.pages[0].hasNext,
          },
        ],
      };

      if (previousGatheringChallenges) {
        queryClient.setQueryData(
          queryKeys.gatheringChallenges(gatheringId, 'IN_PROGRESS'),
          previousGatheringChallenges.pages?.length > 0
            ? newChallenges
            : previousGatheringChallenges,
        );
      }

      return { newChallenges };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gatheringChallenges(gatheringId, 'IN_PROGRESS'),
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gatheringChallenges(gatheringId, 'IN_PROGRESS'),
      });
    },
  });
};

export const useGatheringDelete = (
  gatheringId: number,
  queryClient: QueryClient,
) => {
  return useMutation({
    mutationFn: () => deleteGathering(gatheringId),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.gathering(gatheringId),
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gathering(gatheringId),
      });
    },
  });
};

export const useChallengeDelete = (
  gatheringId: number,
  challengeId: number,
  queryClient: QueryClient,
  inProgress: boolean,
) => {
  return useMutation({
    mutationFn: () => deleteChallenge(challengeId),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.gatheringChallenges(
          gatheringId,
          inProgress ? 'IN_PROGRESS' : 'CLOSED',
        ),
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gatheringChallenges(
          gatheringId,
          inProgress ? 'IN_PROGRESS' : 'CLOSED',
        ),
      });
    },
  });
};

export const useChallengeVerify = (
  gatheringId: number,
  challengeId: number,
  queryClient: QueryClient,
  imageUrl: string,
) => {
  return useMutation({
    mutationFn: () => verificationChallenge(challengeId, imageUrl),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.gatheringChallenges(gatheringId, 'IN_PROGRESS'),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gatheringChallenges(gatheringId, 'IN_PROGRESS'),
      });
    },
  });
};

export function useCalendarChallenges(gatheringId: number) {
  return useQuery({
    queryKey: queryKeys.gatheringCalendar(gatheringId),
    queryFn: async () => {
      const data = await fetchAllChallengesByGatheringId(gatheringId);
      const events =
        data?.map((challenge: ChallengeType) => ({
          id: challenge.gatheringId.toString(),
          start: challenge.startDate,
          end: challenge.endDate,
          title: challenge.title,
          backgroundColor: '#FF2140',
        })) ?? [];
      return {
        ...data,
        events,
      };
    },
  });
}
