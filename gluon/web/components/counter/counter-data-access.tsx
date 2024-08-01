'use client';

import { getCounterProgram, getCounterProgramId } from '@gluon/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';


interface EntryArgs{
  owner: PublicKey,
  title:String,
  message: String,
};

export function useCounterProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getCounterProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getCounterProgram(provider);

  const accounts = useQuery({
    queryKey: ['counter', 'all', { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createEntry = useMutation<string, Error, EntryArgs>({
    mutationKey: ['counter', 'create', { cluster }],
    mutationFn: async ({title, message, owner}) =>{
      const [CounterEntryAddress] = await PublicKey.findProgramAddress(
        [Buffer.from(title), owner.toBuffer()],
        programId,
      );

      return program.methods.createEntry(title, message).accounts({counterEntry: CounterEntryAddress}).rpc();
  },
  onSuccess: signature => {
    transactionToast(signature);
    return accounts.refetch();
  },
  onError: () => toast.error(`Failed to create journal entry: ${error.message}`),
});

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry,
  };
}

export function useCounterProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { programId, program ,  accounts } = useCounterProgram();

  const accountQuery = useQuery({
    queryKey: ['counter', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  });

  const updateEntry = useMutation<string, Error, EntryArgs>({
    mutationKey: ["journalEntry", "update", { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      const [journalEntryAddress] = await PublicKey.findProgramAddress(
        [Buffer.from(title), owner.toBuffer()],
        programId,
      );
   
      return program.methods.updateJournalEntry(title, message).accounts({journalEntry: journalEntryAddress,}).rpc();
    },
    onSuccess: signature => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: error => {
      toast.error(`Failed to update journal entry: ${error.message}`);
    },
  });
   
  const deleteEntry = useMutation({
    mutationKey: ['counter', 'delete', { cluster, account }],
    mutationFn: ( title: string ) =>
      program.methods.deleteEntry(title).accounts({ counterEntry: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  };
}
