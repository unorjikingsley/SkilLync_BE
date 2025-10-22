import { PrismaClient, ProposalStatus, Proposal } from "@prisma/client";
// import { Proposal } from "@prisma/client";

const prisma = new PrismaClient();

interface SubmitProposalInput {
  bidAmount: number;
  coverLetter: string;
  freelancerId: string;
  projectId: string;
}

export const submitProposal = async (data: SubmitProposalInput): Promise<Proposal> => {
  return prisma.proposal.create({ 
    data: { 
      ...data, 
      status: ProposalStatus.PENDING 
    } 
  });
};

export const getAllProposals = async (): Promise<Proposal[]> => {
  return prisma.proposal.findMany();
};

export const getProposalById = async (id: string): Promise<Proposal | null> => {
  return prisma.proposal.findUnique({ where: { id } });
};

export const updateProposal = async (id: string, data: Partial<Proposal>): Promise<Proposal | null> => {
  // data: Partial<Proposal> → Partial is a TypeScript utility type that makes all fields of Proposal optional.
  return prisma.proposal.update({ where: { id }, data });
};

export const deleteProposal = async (id: string): Promise<Proposal | null> => {
  return prisma.proposal.update({ where: { id }, data: { deletedAt: new Date() } });
};
