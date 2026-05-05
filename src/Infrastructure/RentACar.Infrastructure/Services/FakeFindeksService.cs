using RentACar.Application.Interfaces;

namespace RentACar.Infrastructure.Services;

public class FakeFindeksService : IFindeksService
{
    public Task<int> GetFindeksScoreAsync(string tcKimlikNo)
    {
        if (string.IsNullOrWhiteSpace(tcKimlikNo) || tcKimlikNo.Length != 11)
            return Task.FromResult(0);

        // Müşterinin TC numarasının ortasından 4 hane alıyoruz (Örn: 12345678901 -> 4567)
        // Bu sayede TC numarası aynı olan kişinin Findeks puanı HER ZAMAN aynı çıkacak!
        string seedDigits = tcKimlikNo.Substring(4, 4);
        int magicNumber = int.Parse(seedDigits);

        // Modüler aritmetik ile puanı 0-1400 arasına çekip, üzerine 500 taban puan ekliyoruz (Maks 1900)
        int score = (magicNumber % 1400) + 500;

        if (score > 1900) score = 1900;

        return Task.FromResult(score);
    }
}

/*

Findeks (KKB) Sorgulaması için Şartlar: Kredi Kayıt Bürosu (KKB) ile ciddi bir kurumsal 
anlaşma yapman, KVKK aydınlatma metinlerini onaylatman ve çok yüksek güvenlikli sunucular
kullanman gerekir. Bireysel olarak veya küçük bir şahıs şirketiyle Findeks API'sine erişmek
imkansıza yakındır; genellikle büyük rent a car firmaları veya finans kuruluşları alabilir.

*projemde kullanmak istediğim için bu FakeFindeksService'i oluşturdum. Gerçek bir Findeks entegrasyonu 
*için KKB ile iletişime geçmen ve izinler alman gerekecektir.

Findeks Simülasyonu (Aynı TC'ye Hep Aynı Puanı Veren Zeki Algoritma)
Eğer direkt Random kullanırsak, adam sayfayı her yenilediğinde Findeks puanı değişir (bu mantıksız olur).
Bunun yerine müşterinin TC numarasını bir "Seed (Tohum)" olarak kullanıp matematiksel bir işlemle 
0-1900 arası puan üretiriz. Böylece Ahmet'in puanı her sorguladığımızda aynı (örn: 1450) çıkar!

*/