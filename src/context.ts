export type ContextName = 'add-card' | 'confirm' | 'delayed-activation' | 'delete' | 'inactive' | 'invoice' | 'join-team' | 'join-workspace' | 'invite-friend' | 'payment-confirmation' | 'referral' | 'reset' | 'verify-email'

interface AddCardContext {

}

interface ConfirmContext {
    redirect?: string
    url: string
    token: string
}

interface DelayedActivationContext {
    url?: string
}

interface DeleteContext {
    redirect?: string
    url: string
    token: string
}

interface InactiveContext {

}

interface InvoiceContext {
    storage: string
    bandwidth: string
    amount: string
}

interface JoinTeamContext {
    memberName: string
    teamName: string
    urlAcceptInvitation: string
}

interface InviteFriendContext {
    inviteEmail: string;
    hostEmail: string;
    hostFullName: string;
    registerUrl: string;
}

interface PaymentConfirmationContext {
    amount: string
}

interface ReferralContext {
    senderUser: string
    url: string
}

interface ResetContext {
    redirect?: string
    url: string
    token: string
}

interface VerifyEmailContext {
    name: string
    url: string
}