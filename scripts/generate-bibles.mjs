import fs from 'node:fs';
import path from 'node:path';

// John's Gospel data for KJV, WEB, Segond, Synodal
const johnData = {
  kjv: {
    1: {
      blocks: [
        { type: 's', heading: 'The Word became Flesh' },
        {
          type: 'p',
          verses: [
            { n: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
            { n: 2, text: 'The same was in the beginning with God.' },
            { n: 3, text: 'All things were made by him; and without him was not any thing made that was made.' },
            { n: 4, text: 'In him was life; and the life was the light of men.' },
            { n: 5, text: 'And the light shineth in darkness; and the darkness comprehended it not.' }
          ]
        },
        {
          type: 'p',
          verses: [
            { n: 6, text: 'There was a man sent from God, whose name was John.' },
            { n: 7, text: 'The same came for a witness, to bear witness of the Light, that all men through him might believe.' },
            { n: 8, text: 'He was not that Light, but was sent to bear witness of that Light.' },
            { n: 9, text: 'That was the true Light, which lighteth every man that cometh into the world.' },
            { n: 10, text: 'He was in the world, and the world was made by him, and the world knew him not.' },
            { n: 11, text: 'He came unto his own, and his own received him not.' },
            { n: 12, text: 'But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name:' },
            { n: 13, text: 'Which were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God.' },
            { n: 14, text: 'And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.' }
          ]
        },
        { type: 's', heading: 'The Witness of John' },
        {
          type: 'p',
          verses: [
            { n: 15, text: 'John bare witness of him, and cried, saying, This was he of whom I spake, He that cometh after me is preferred before me: for he was before me.' },
            { n: 16, text: 'And of his fulness have all we received, and grace for grace.' },
            { n: 17, text: 'For the law was given by Moses, but grace and truth came by Jesus Christ.' },
            { n: 18, text: 'No man hath seen God at any time; the only begotten Son, which is in the bosom of the Father, he hath declared him.' }
          ]
        }
      ]
    },
    2: {
      blocks: [
        { type: 's', heading: 'The Marriage in Cana' },
        {
          type: 'p',
          verses: [
            { n: 1, text: 'And the third day there was a marriage in Cana of Galilee; and the mother of Jesus was there:' },
            { n: 2, text: 'And both Jesus was called, and his disciples, to the marriage.' },
            { n: 3, text: 'And when they wanted wine, the mother of Jesus saith unto him, They have no wine.' },
            { n: 4, text: 'Jesus saith unto her, Woman, what have I to do with thee? mine hour is not yet come.' },
            { n: 5, text: 'His mother saith unto the servants, Whatsoever he saith unto you, do it.' },
            { n: 6, text: 'And there were set there six waterpots of stone, after the manner of the purifying of the Jews, containing two or three firkins apiece.' },
            { n: 7, text: 'Jesus saith unto them, Fill the waterpots with water. And they filled them up to the brim.' },
            { n: 8, text: 'And he saith unto them, Draw out now, and bear unto the governor of the feast. And they bare it.' },
            { n: 9, text: 'When the ruler of the feast had tasted the water that was made wine, and knew not whence it was: (but the servants which drew the water knew;) the governor of the feast called the bridegroom,' },
            { n: 10, text: 'And saith unto him, Every man at the beginning doth set forth good wine; and when men have well drunk, then that which is worse: but thou hast kept the good wine until now.' },
            { n: 11, text: 'This beginning of miracles did Jesus in Cana of Galilee, and manifested forth his glory; and his disciples believed on him.' }
          ]
        }
      ]
    },
    3: {
      blocks: [
        { type: 's', heading: 'Nicodemus comes to Jesus' },
        {
          type: 'p',
          verses: [
            { n: 1, text: 'There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:' },
            { n: 2, text: 'The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him.' },
            { n: 3, text: 'Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.' },
            { n: 4, text: 'Nicodemus saith unto him, How can a man be born when he is old? can he enter the second time into his mother\'s womb, and be born?' },
            { n: 5, text: 'Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God.' },
            { n: 6, text: 'That which is born of the flesh is flesh; and that which is born of the Spirit is spirit.' },
            { n: 7, text: 'Marvel not that I said unto thee, Ye must be born again.' },
            { n: 8, text: 'The wind bloweth where it listeth, and thou hearest the sound thereof, but canst not tell whence it cometh, and whither it goeth: so is every one that is born of the Spirit.' },
            { n: 9, text: 'Nicodemus answered and said unto him, How can these things be?' },
            { n: 10, text: 'Jesus answered and said unto him, Art thou a master of Israel, and knowest not these things?' },
            { n: 11, text: 'Verily, verily, I say unto thee, We speak that we do know, and testify that we have seen; and ye receive not our witness.' },
            { n: 12, text: 'If I have told you earthly things, and ye believe not, how shall ye believe, if I tell you of heavenly things?' },
            { n: 13, text: 'And no man hath ascended up to heaven, but he that came down from heaven, even the Son of man which is in heaven.' },
            { n: 14, text: 'And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up:' },
            { n: 15, text: 'That whosoever believeth in him should not perish, but have eternal life.' },
            { n: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
            { n: 17, text: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.' },
            { n: 18, text: 'He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.' },
            { n: 19, text: 'And this is the condemnation, that light is come into the world, and men loved darkness rather than light, because their deeds were evil.' },
            { n: 20, text: 'For every one that doeth evil hateth the light, neither cometh to the light, lest his deeds should be reproved.' },
            { n: 21, text: 'But he that doeth truth cometh to the light, that his deeds may be made manifest, that they are wrought in God.' }
          ]
        }
      ]
    }
  },

  web: {
    1: {
      blocks: [
        { type: 's', heading: 'The Word Became Flesh' },
        {
          type: 'p',
          verses: [
            { n: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
            { n: 2, text: 'The same was in the beginning with God.' },
            { n: 3, text: 'All things were made through him. Without him, nothing was made that has been made.' },
            { n: 4, text: 'In him was life, and the life was the light of men.' },
            { n: 5, text: 'The light shines in the darkness, and the darkness hasn\'t overcome it.' }
          ]
        },
        {
          type: 'p',
          verses: [
            { n: 6, text: 'There came a man, sent from God, whose name was John.' },
            { n: 7, text: 'The same came as a witness, that he might testify about the light, that all might believe through him.' },
            { n: 8, text: 'He was not the light, but was sent that he might testify about the light.' },
            { n: 9, text: 'The true light that enlightens everyone was coming into the world.' },
            { n: 10, text: 'He was in the world, and the world was made through him, and the world didn\'t recognize him.' },
            { n: 11, text: 'He came to his own, and those who were his own didn\'t receive him.' },
            { n: 12, text: 'But as many as received him, to them he gave the right to become God\'s children, to those who believe in his name:' },
            { n: 13, text: 'who were born not of blood, nor of the will of the flesh, nor of the will of man, but of God.' },
            { n: 14, text: 'The Word became flesh, and lived among us. We saw his glory, such glory as of the one and only Son of the Father, full of grace and truth.' }
          ]
        },
        { type: 's', heading: 'The Witness of John' },
        {
          type: 'p',
          verses: [
            { n: 15, text: 'John testified about him. He cried out, saying, "This was he of whom I said, \'He who comes after me has surpassed me, for he was before me.\'"' },
            { n: 16, text: 'From his fullness we all received grace upon grace.' },
            { n: 17, text: 'For the law was given through Moses. Grace and truth were realized through Jesus Christ.' },
            { n: 18, text: 'No one has seen God at any time. The one and only Son, who is in the bosom of the Father, he has declared him.' }
          ]
        }
      ]
    },
    2: {
      blocks: [
        { type: 's', heading: 'The Wedding in Cana' },
        {
          type: 'p',
          verses: [
            { n: 1, text: 'The third day, there was a wedding in Cana of Galilee. Jesus\' mother was there.' },
            { n: 2, text: 'Jesus also was invited, with his disciples, to the wedding.' },
            { n: 3, text: 'When the wine ran out, Jesus\' mother said to him, "They have no wine."' },
            { n: 4, text: 'Jesus said to her, "Woman, what does that have to do with you and me? My hour has not yet come."' },
            { n: 5, text: 'His mother said to the servants, "Whatever he says to you, do it."' },
            { n: 6, text: 'Now there were six stone water jars that stood there, after the Jews\' manner of purifying, containing two or three metretes apiece.' },
            { n: 7, text: 'Jesus said to them, "Fill the water jars with water." They filled them up to the brim.' },
            { n: 8, text: 'He said to them, "Now draw some out, and take it to the ruler of the feast." So they took it.' },
            { n: 9, text: 'When the ruler of the feast tasted the water now become wine, and didn\'t know where it came from (but the servants who had drawn the water knew), the ruler of the feast called the bridegroom,' },
            { n: 10, text: 'and said to him, "Everyone serves the good wine first, and when the guests have drunk freely, then that which is worse. You have kept the good wine until now!"' },
            { n: 11, text: 'This beginning of his signs Jesus did in Cana of Galilee, and revealed his glory; and his disciples believed in him.' }
          ]
        }
      ]
    },
    3: {
      blocks: [
        { type: 's', heading: 'Nicodemus Visits Jesus' },
        {
          type: 'p',
          verses: [
            { n: 1, text: 'Now there was a man of the Pharisees named Nicodemus, a member of the Jewish ruling council.' },
            { n: 2, text: 'The same came to him by night, and said to him, "Rabbi, we know that you are a teacher come from God, for no one can do these signs that you do, unless God is with him."' },
            { n: 3, text: 'Jesus answered him, "Most certainly, I tell you, unless one is born anew, he can\'t see the Kingdom of God."' },
            { n: 4, text: 'Nicodemus said to him, "How can a man be born when he is old? Can he enter a second time into his mother\'s womb, and be born?"' },
            { n: 5, text: 'Jesus answered, "Most certainly I tell you, unless one is born of water and spirit, he can\'t enter into the Kingdom of God.' },
            { n: 6, text: 'That which is born of the flesh is flesh. That which is born of the Spirit is spirit.' },
            { n: 7, text: 'Don\'t marvel that I said to you, \'You must be born anew.\'' },
            { n: 8, text: 'The wind blows where it wants to, and you hear its sound, but don\'t know where it comes from and where it is going. So is everyone who is born of the Spirit."' },
            { n: 9, text: 'Nicodemus answered him, "How can these things be?"' },
            { n: 10, text: 'Jesus answered him, "Are you the teacher of Israel, and don\'t understand these things?' },
            { n: 11, text: 'Most certainly I tell you, we speak that which we know, and testify of that which we have seen, and you don\'t receive our witness.' },
            { n: 12, text: 'If I told you earthly things and you don\'t believe, how will you believe if I tell you of heavenly things?' },
            { n: 13, text: 'No one has ascended into heaven, but he who descended out of heaven, the Son of Man, who is in heaven.' },
            { n: 14, text: 'As Moses lifted up the serpent in the wilderness, even so must the Son of Man be lifted up,' },
            { n: 15, text: 'that whoever believes in him should not perish, but have eternal life.' },
            { n: 16, text: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.' },
            { n: 17, text: 'For God didn\'t send his Son into the world to judge the world, but that the world should be saved through him.' },
            { n: 18, text: 'He who believes in him is not judged. He who doesn\'t believe has been judged already, because he has not believed in the name of the one and only Son of God.' },
            { n: 19, text: 'This is the judgment, that the light has come into the world, and men loved the darkness rather than the light; for their works were evil.' },
            { n: 20, text: 'For everyone who does evil hates the light, and doesn\'t come to the light, lest his works would be exposed.' },
            { n: 21, text: 'But he who does the truth comes to the light, that his works may be revealed, that they have been done in God."' }
          ]
        }
      ]
    }
  },

  segond: {
    1: {
      blocks: [
        { type: 's', heading: 'La Parole faite chair' },
        {
          type: 'p',
          verses: [
            { n: 1, text: 'Au commencement était la Parole, et la Parole était avec Dieu, et la Parole était Dieu.' },
            { n: 2, text: 'Elle était au commencement avec Dieu.' },
            { n: 3, text: 'Toutes choses ont été faites par elle, et rien de ce qui a été fait n\'a été fait sans elle.' },
            { n: 4, text: 'En elle était la vie, et la vie était la lumière des hommes.' },
            { n: 5, text: 'La lumière luit dans les ténèbres, et les ténèbres ne l\'ont point reçue.' }
          ]
        },
        {
          type: 'p',
          verses: [
            { n: 6, text: 'Il y eut un homme envoyé de Dieu: son nom était Jean.' },
            { n: 7, text: 'Il vint pour servir de témoin, pour rendre témoignage à la lumière, afin que tous crussent par lui.' },
            { n: 8, text: 'Il n\'était pas la lumière, mais il parut pour rendre témoignage à la lumière.' },
            { n: 9, text: 'Cette lumière était la véritable lumière, qui, en venant dans le monde, éclaire tout homme.' },
            { n: 10, text: 'Elle était dans le monde, et le monde a été fait par elle, et le monde ne l\'a point connue.' },
            { n: 11, text: 'Elle est venue chez les siens, et les siens ne l\'ont point reçue.' },
            { n: 12, text: 'Mais à tous ceux qui l\'ont reçue, à ceux qui croient en son nom, elle a donné le pouvoir de devenir enfants de Dieu,' },
            { n: 13, text: 'lesquels sont nés, non du sang, ni de la volonté de la chair, ni de la volonté de l\'homme, mais de Dieu.' },
            { n: 14, text: 'Et la parole a été faite chair, et elle a habité parmi nous, pleine de grâce et de vérité; et nous avons contemplé sa gloire, une gloire comme la gloire du Fils unique venu du Père.' }
          ]
        },
        { type: 's', heading: 'Le témoignage de Jean' },
        {
          type: 'p',
          verses: [
            { n: 15, text: 'Jean lui a rendu témoignage, et s\'est écrié: C\'est celui dont j\'ai dit: Celui qui vient après moi m\'a précédé, car il était avant moi.' },
            { n: 16, text: 'Et nous avons tous reçu de sa plénitude, et grâce pour grâce;' },
            { n: 17, text: 'car la loi a été donnée par Moïse, la grâce et la vérité sont venues par Jésus Christ.' },
            { n: 18, text: 'Personne n\'a jamais vu Dieu; le Fils unique, qui est dans le sein du Père, est celui qui l\'a fait connaître.' }
          ]
        }
      ]
    },
    2: {
      blocks: [
        { type: 's', heading: 'Les noces de Cana' },
        {
          type: 'p',
          verses: [
            { n: 1, text: 'Trois jours après, il y eut des noces à Cana en Galilée. La mère de Jésus était là,' },
            { n: 2, text: 'et Jésus fut aussi invité aux noces avec ses disciples.' },
            { n: 3, text: 'Le vin ayant manqué, la mère de Jésus lui dit: Ils n\'ont plus de vin.' },
            { n: 4, text: 'Jésus lui répondit: Femme, qu\'y a-t-il entre moi et toi? Mon heure n\'est pas encore venue.' },
            { n: 5, text: 'Sa mère dit aux serviteurs: Faites ce qu\'il vous dira.' },
            { n: 6, text: 'Or, il y avait là six vases de pierre, destinés aux purifications des Juifs, et contenant chacun deux ou trois mesures.' },
            { n: 7, text: 'Jésus leur dit: Remplissez d\'eau ces vases. Et ils les remplirent jusqu\'au bord.' },
            { n: 8, text: 'Puisez maintenant, leur dit-il, et portez-en à l\'ordonnateur du repas. Et ils en portèrent.' },
            { n: 9, text: 'Quand l\'ordonnateur du repas eut goûté l\'eau changée en vin, ne sachant d\'où venait ce vin, tandis que les serviteurs, qui avaient puisé l\'eau, le savaient bien, il appela l\'époux,' },
            { n: 10, text: 'et lui dit: Tout homme sert d\'abord le bon vin, puis le moins bon après qu\'on s\'est enivré; toi, tu as gardé le bon vin jusqu\'à présent.' },
            { n: 11, text: 'Tel fut, à Cana en Galilée, le premier des miracles que fit Jésus. Il manifesta sa gloire, et ses disciples crurent en lui.' }
          ]
        }
      ]
    },
    3: {
      blocks: [
        { type: 's', heading: 'Entretien avec Nicodème' },
        {
          type: 'p',
          verses: [
            { n: 1, text: 'Mais il y eut un homme d\'entre les pharisiens, nommé Nicodème, un chef des Juifs,' },
            { n: 2, text: 'qui vint, lui, auprès de Jésus, de nuit, et lui dit: Rabbi, nous savons que tu es un docteur venu de Dieu; car personne ne peut faire ces miracles que tu fais, si Dieu n\'est avec lui.' },
            { n: 3, text: 'Jésus lui répondit: En vérité, en vérité, je te le dis, si un homme ne naît de nouveau, il ne peut voir le royaume de Dieu.' },
            { n: 4, text: 'Nicodème lui dit: Comment un homme peut-il naître quand il est vieux? Peut-il rentrer dans le sein de sa mère et naître?' },
            { n: 5, text: 'Jésus répondit: En vérité, en vérité, je te le dis, si un homme ne naît d\'eau et d\'Esprit, il ne peut entrer dans le royaume de Dieu.' },
            { n: 6, text: 'Ce qui est né de la chair est chair, et ce qui est né de l\'Esprit est esprit.' },
            { n: 7, text: 'Ne t\'étonne pas que je t\'aie dit: Il faut que vous naissiez de nouveau.' },
            { n: 8, text: 'Le vent souffle où il veut, et tu en entends le bruit; mais tu ne sais d\'où il vient, ni où il va. Il en est ainsi de tout homme qui est né de l\'Esprit.' },
            { n: 9, text: 'Nicodème lui dit: Comment cela peut-il se faire?' },
            { n: 10, text: 'Jésus lui répondit: Tu es le docteur d\'Israël, et tu ne sais pas ces choses!' },
            { n: 11, text: 'En vérité, en vérité, je te le dis, nous disons ce que nous savons, et nous rendons témoignage de ce que nous avons vu; et vous ne recevez pas notre témoignage.' },
            { n: 12, text: 'Si vous ne croyez pas quand je vous ai parlé des choses terrestres, comment croirez-vous quand je vous parlerai des choses célestes?' },
            { n: 13, text: 'Personne n\'est monté au ciel, si ce n\'est celui qui est descendu du ciel, le Fils de l\'homme qui est dans le ciel.' },
            { n: 14, text: 'Et comme Moïse éleva le serpent dans le désert, il faut de même que le Fils de l\'homme soit élevé,' },
            { n: 15, text: 'afin que quiconque croit en lui ait la vie éternelle.' },
            { n: 16, text: 'Car Dieu a tant aimé le monde qu\'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu\'il ait la vie éternelle.' },
            { n: 17, text: 'Dieu, en effet, n\'a pas envoyé son Fils dans le monde pour qu\'il juge le monde, mais pour que le monde soit sauvé par lui.' },
            { n: 18, text: 'Celui qui croit en lui n\'est point jugé; mais celui qui ne croit pas est déjà jugé, parce qu\'il n\'a pas cru au nom du Fils unique de Dieu.' },
            { n: 19, text: 'Et ce jugement c\'est que, la lumière étant venue dans le monde, les hommes ont préféré les ténèbres à la lumière, parce que leurs œuvres étaient mauvaises.' },
            { n: 20, text: 'Car quiconque fait le mal hait la lumière, et ne vient point à la lumière, de peur que ses œuvres ne soient dévoilées;' },
            { n: 21, text: 'mais celui qui agit selon la vérité vient à la lumière, afin que ses œuvres soient manifestées, parce qu\'elles sont faites en Dieu.' }
          ]
        }
      ]
    }
  },

  synodal: {
    1: {
      blocks: [
        { type: 's', heading: 'Слово стало плотию' },
        {
          type: 'p',
          verses: [
            { n: 1, text: 'В начале было Слово, и Слово было у Бога, и Слово было Бог.' },
            { n: 2, text: 'Оно было в начале у Бога.' },
            { n: 3, text: 'Все чрез Него начало быть, и без Него ничто не начало быть, что начало быть.' },
            { n: 4, text: 'В Нем была жизнь, и жизнь была свет человеков.' },
            { n: 5, text: 'И свет во тьме светит, и тьма не объяла его.' }
          ]
        },
        {
          type: 'p',
          verses: [
            { n: 6, text: 'Был человек, посланный от Бога; имя ему Иоанн.' },
            { n: 7, text: 'Он пришел для свидетельства, чтобы свидетельствовать о Свете, дабы все уверовали чрез него.' },
            { n: 8, text: 'Он не был свет, но был послан, чтобы свидетельствовать о Свете.' },
            { n: 9, text: 'Был Свет истинный, Который просвещает всякого человека, приходящего в мир.' },
            { n: 10, text: 'В мире был, и мир чрез Него начал быть, и мир Его не познал.' },
            { n: 11, text: 'Пришел к своим, и свои Его не приняли.' },
            { n: 12, text: 'А тем, которые приняли Его, верующим во имя Его, дал власть быть чадами Божиими,' },
            { n: 13, text: 'которые ни от крови, ни от хотения плоти, ни от хотения мужа, но от Бога родились.' },
            { n: 14, text: 'И Слово стало плотию, и обитало с нами, полное благодати и истины; и мы видели славу Его, славу, как Единородного от Отца.' }
          ]
        },
        { type: 's', heading: 'Свидетельство Иоанна' },
        {
          type: 'p',
          verses: [
            { n: 15, text: 'Иоанн свидетельствует о Нем и, восклицая, говорит: Сей был Тот, о Котором я сказал, что Идущий за мною стал впереди меня, потому что был прежде меня.' },
            { n: 16, text: 'И от полноты Его все мы приняли и благодать на благодать,' },
            { n: 17, text: 'ибо закон дан чрез Моисея; благодать же и истина произошли чрез Иисуса Христа.' },
            { n: 18, text: 'Бога не видел никто никогда; Единородный Сын, сущий в недре Отчем, Он явил.' }
          ]
        }
      ]
    },
    2: {
      blocks: [
        { type: 's', heading: 'Брак в Кане Галилейской' },
        {
          type: 'p',
          verses: [
            { n: 1, text: 'На третий день был брак в Кане Галилейской, и Матерь Иисуса была там.' },
            { n: 2, text: 'Был также зван Иисус и ученики Его на брак.' },
            { n: 3, text: 'И как недоставало вина, то Матерь Иисуса говорит Ему: вина нет у них.' },
            { n: 4, text: 'Иисус говорит Ей: что Мне и Тебе, Жено? еще не пришел час Мой.' },
            { n: 5, text: 'Матерь Его сказала служителям: что скажет Он вам, то сделайте.' },
            { n: 6, text: 'Было же тут шесть каменных водоносов, стоявших по обычаю очищения Иудейского, вмещавших по две или по три меры.' },
            { n: 7, text: 'Иисус говорит им: наполните сосуды водою. И наполнили их до верха.' },
            { n: 8, text: 'И говорит им: теперь почерпните и несите к распорядителю пира. И понесли.' },
            { n: 9, text: 'Когда же распорядитель отведал воды, сделавшейся вином, — а он не знал, откуда это вино, знали только служители, почерпавшие воду, — тогда распорядитель зовет жениха' },
            { n: 10, text: 'и говорит ему: всякий человек подает сперва хорошее вино, а когда напьются, тогда худшее; а ты хорошее вино сберег доселе.' },
            { n: 11, text: 'Так положил Иисус начало чудесам в Кане Галилейской и явил славу Свою; и уверовали в Него ученики Его.' }
          ]
        }
      ]
    },
    3: {
      blocks: [
        { type: 's', heading: 'Беседа с Никодимом' },
        {
          type: 'p',
          verses: [
            { n: 1, text: 'Между фарисеями был некто, именем Никодим, один из начальников Иудейских.' },
            { n: 2, text: 'Он пришел к Иисусу ночью и сказал Ему: Равви! мы знаем, что Ты учитель, пришедший от Бога; ибо таких чудес, какие Ты творишь, никто не может творить, если Бог не с ним.' },
            { n: 3, text: 'Иисус сказал ему в ответ: истинно, истинно говорю тебе, если кто не родится свыше, не может увидеть Царствия Божия.' },
            { n: 4, text: 'Никодим говорит Ему: как может человек родиться, будучи стар? неужели может он в другой раз войти в утробу матери своей и родиться?' },
            { n: 5, text: 'Иисус отвечал: истинно, истинно говорю тебе, если кто не родится от воды и Духа, не может войти в Царствие Божие.' },
            { n: 6, text: 'Рожденное от плоти есть плоть, а рожденное от Духа есть дух.' },
            { n: 7, text: 'Не удивляйся тому, что Я сказал тебе: должно вам родиться свыше.' },
            { n: 8, text: 'Дух дышит, где хочет, и голос его слышишь, а не знаешь, откуда приходит и куда уходит: так бывает со всяким, рожденным от Духа.' },
            { n: 9, text: 'Никодим сказал Ему в ответ: как это может быть?' },
            { n: 10, text: 'Иисус отвечал и сказал ему: ты — учитель Израилев, и этого ли не знаешь?' },
            { n: 11, text: 'Истинно, истинно говорю тебе: мы говорим о том, что знаем, и свидетельствуем о том, что видели, а вы свидетельства нашего не принимаете.' },
            { n: 12, text: 'Если Я сказал вам о земном, и вы не верите, — как поверите, если буду говорить вам о небесном?' },
            { n: 13, text: 'Никто не восходил на небо, как только сшедший с небес Сын Человеческий, сущий на небесах.' },
            { n: 14, text: 'И как Моисей вознес змию в пустыне, так должно вознесену быть Сыну Человеческому,' },
            { n: 15, text: 'дабы всякий, верующий в Него, не погиб, но имел жизнь вечную.' },
            { n: 16, text: 'Ибо так возлюбил Бог мир, что отдал Сына Своего Единородного, дабы всякий верующий в Него, не погиб, но имел жизнь вечную.' },
            { n: 17, text: 'Ибо не послал Бог Сына Своего в мир, чтобы судить мир, но чтобы мир спасен был чрез Него.' },
            { n: 18, text: 'Верующий в Него не судится, а неверующий уже осужден, потому что не уверовал во имя Единородного Сына Божия.' },
            { n: 19, text: 'Суд же состоит в том, что свет пришел в мир; но люди более возлюбили тьму, нежели свет, потому что дела их были злы;' },
            { n: 20, text: 'ибо всякий, делающий злое, ненавидит свет и не идет к свету, чтобы не обличились дела его, потому что они злы,' },
            { n: 21, text: 'а поступающий по правде идет к свету, дабы явны были дела его, потому что они в Боге соделаны.' }
          ]
        }
      ]
    }
  }
};

// Psalm data (poetry lines \q and superscriptions \d)
const psalmsData = {
  kjv: {
    1: {
      blocks: [
        { type: 's', heading: 'The Way of the Righteous and the Wicked' },
        {
          type: 'q',
          verses: [
            { n: 1, text: 'Blessed is the man that walketh not in the counsel of the ungodly, nor standeth in the way of sinners, nor sitteth in the seat of the scornful.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 2, text: 'But his delight is in the law of the LORD; and in his law doth he meditate day and night.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 3, text: 'And he shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season; his leaf also shall not wither; and whatsoever he doeth shall prosper.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 4, text: 'The ungodly are not so: but are like the chaff which the wind driveth away.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 5, text: 'Therefore the ungodly shall not stand in the judgment, nor sinners in the congregation of the righteous.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 6, text: 'For the LORD knoweth the way of the righteous: but the way of the ungodly shall perish.' }
          ]
        }
      ]
    },
    3: {
      blocks: [
        { type: 'd', heading: 'A Psalm of David, when he fled from Absalom his son.' },
        {
          type: 'q',
          verses: [
            { n: 1, text: 'LORD, how are they increased that trouble me! many are they that rise up against me.' },
            { n: 2, text: 'Many there be which say of my soul, There is no help for him in God. Selah.' },
            { n: 3, text: 'But thou, O LORD, art a shield for me; my glory, and the lifter up of mine head.' },
            { n: 4, text: 'I cried unto the LORD with my voice, and he heard me out of his holy hill. Selah.' },
            { n: 5, text: 'I laid me down and slept; I awaked; for the LORD sustained me.' },
            { n: 6, text: 'I will not be afraid of ten thousands of people, that have set themselves against me round about.' },
            { n: 7, text: 'Arise, O LORD; save me, O my God: for thou hast smitten all mine enemies upon the cheek bone; thou hast broken the teeth of the ungodly.' },
            { n: 8, text: 'Salvation belongeth unto the LORD: thy blessing is upon thy people. Selah.' }
          ]
        }
      ]
    },
    9: {
      blocks: [
        { type: 'd', heading: 'To the chief Musician upon Muthlabben, A Psalm of David.' },
        {
          type: 'q',
          verses: [
            { n: 1, text: 'I will praise thee, O LORD, with my whole heart; I will shew forth all thy marvellous works.' },
            { n: 2, text: 'I will be glad and rejoice in thee: I will sing praise to thy name, O thou most High.' },
            { n: 3, text: 'When mine enemies are turned back, they shall fall and perish at thy presence.' },
            { n: 4, text: 'For thou hast maintained my right and my cause; thou satest in the throne judging right.' }
          ]
        }
      ]
    },
    10: {
      blocks: [
        {
          type: 'q',
          verses: [
            { n: 1, text: 'Why standest thou afar off, O LORD? why hidest thou thyself in times of trouble?' },
            { n: 2, text: 'The wicked in his pride doth persecute the poor: let them be taken in the devices that they have imagined.' },
            { n: 3, text: 'For the wicked boasteth of his heart\'s desire, and blesseth the covetous, whom the LORD abhorreth.' },
            { n: 4, text: 'The wicked, through the pride of his countenance, will not seek after God: God is not in all his thoughts.' }
          ]
        }
      ]
    },
    23: {
      blocks: [
        { type: 'd', heading: 'A Psalm of David.' },
        {
          type: 'q',
          verses: [
            { n: 1, text: 'The LORD is my shepherd; I shall not want.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 2, text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 3, text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 5, text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 6, text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.' }
          ]
        }
      ]
    }
  },

  web: {
    1: {
      blocks: [
        { type: 's', heading: 'The Way of the Righteous' },
        {
          type: 'q',
          verses: [
            { n: 1, text: 'Blessed is the man who doesn\'t walk in the counsel of the wicked, nor stand in the way of sinners, nor sit in the seat of scoffers;' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 2, text: 'but his delight is in Yahweh\'s law. On his law he meditates day and night.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 3, text: 'He will be like a tree planted by the streams of water, that produces its fruit in its season, whose leaf also does not wither. Whatever he does shall prosper.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 4, text: 'The wicked are not so, but are like the chaff which the wind drives away.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 5, text: 'Therefore the wicked will not stand in the judgment, nor sinners in the congregation of the righteous.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 6, text: 'For Yahweh knows the way of the righteous, but the way of the wicked will perish.' }
          ]
        }
      ]
    },
    3: {
      blocks: [
        { type: 'd', heading: 'A Psalm by David, when he fled from Absalom his son.' },
        {
          type: 'q',
          verses: [
            { n: 1, text: 'Yahweh, how my adversaries have increased! Many are those who rise up against me.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 2, text: 'Many there are who say of my soul, "There is no help for him in God." Selah.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 3, text: 'But you, Yahweh, are a shield around me, my glory, and the one who lifts up my head.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 4, text: 'I cry to Yahweh with my voice, and he answers me out of his holy hill. Selah.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 5, text: 'I laid myself down and slept. I awakened; for Yahweh sustains me.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 6, text: 'I will not be afraid of tens of thousands of people who have set themselves against me on every side.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 7, text: 'Arise, Yahweh! Save me, my God! For you have struck all of my enemies on the cheek bone. You have broken the teeth of the wicked.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 8, text: 'Salvation belongs to Yahweh. Your blessing be on your people. Selah.' }
          ]
        }
      ]
    },
    23: {
      blocks: [
        { type: 'd', heading: 'A Psalm by David.' },
        {
          type: 'q',
          verses: [
            { n: 1, text: 'Yahweh is my shepherd: I shall lack nothing.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 2, text: 'He makes me lie down in green pastures. He leads me beside still waters.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 3, text: 'He restores my soul. He guides me in the paths of righteousness for his name\'s sake.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 4, text: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 5, text: 'You prepare a table before me in the presence of my enemies. You have anointed my head with oil. My cup runs over.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 6, text: 'Surely goodness and loving kindness shall follow me all the days of my life, and I will dwell in Yahweh\'s house forever.' }
          ]
        }
      ]
    }
  },

  segond: {
    1: {
      blocks: [
        { type: 's', heading: 'Les deux voies' },
        {
          type: 'q',
          verses: [
            { n: 1, text: 'Heureux l\'homme qui ne marche pas selon le conseil des méchants, qui ne s\'arrête pas sur la voie des pécheurs, et qui ne s\'assied pas en compagnie des moqueurs,' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 2, text: 'mais qui trouve son plaisir dans la loi de l\'Éternel, et qui la médite jour et nuit!' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 3, text: 'Il est comme un arbre planté près d\'un courant d\'eau, qui donne son fruit en sa saison, et dont le feuillage ne se flétrit point: tout ce qu\'il fait lui réussit.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 4, text: 'Il n\'en est pas ainsi des méchants: ils sont comme la paille que le vent dissipe.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 5, text: 'C\'est pourquoi les méchants ne résistent pas au jour du jugement, ni les pécheurs dans l\'assemblée des justes;' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 6, text: 'car l\'Éternel connaît la voie des justes, et la voie des pécheurs mène à la ruine.' }
          ]
        }
      ]
    },
    3: {
      blocks: [
        { type: 'd', heading: 'Psaume de David. A l\'occasion de sa fuite devant Absalom, son fils.' },
        {
          type: 'q',
          verses: [
            { n: 1, text: 'O Éternel, que mes ennemis sont nombreux! Quelle multitude se lève contre moi!' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 2, text: 'Combien qui disent à mon sujet: Plus de salut pour lui auprès de Dieu! — Pause.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 3, text: 'Mais toi, ô Éternel! tu es mon bouclier, tu es ma gloire, et tu relèves ma tête.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 4, text: 'De ma voix je crie à l\'Éternel, et il me répond de sa montagne sainte. — Pause.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 5, text: 'Je me couche, et je m\'endors; je me réveille, car l\'Éternel est mon soutien.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 6, text: 'Je ne crains pas les myriades de peuples qui m\'assiègent de toutes parts.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 7, text: 'Lève-toi, Éternel! sauve-moi, mon Dieu! Car tu frappes à la joue tous mes ennemis, tu brises les dents des méchants.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 8, text: 'Le salut est auprès de l\'Éternel: que ta bénédiction soit sur ton peuple! — Pause.' }
          ]
        }
      ]
    },
    23: {
      blocks: [
        { type: 'd', heading: 'Cantique de David.' },
        {
          type: 'q',
          verses: [
            { n: 1, text: 'L\'Éternel est mon berger: je ne manquerai de rien.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 2, text: 'Il me fait reposer dans de verts pâturages, il me dirige près des eaux paisibles.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 3, text: 'Il restaure mon âme, il me conduit dans les sentiers de la justice, à cause de son nom.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 4, text: 'Quand je marche dans la vallée de l\'ombre de la mort, je ne crains aucun mal, car tu es avec moi: ta houlette et ton bâton me rassurent.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 5, text: 'Tu dresses devant moi une table, en face de mes adversaires; tu oins d\'huile ma tête, et ma coupe déborde.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 6, text: 'Oui, le bonheur et la grâce m\'accompagneront tous les jours de ma vie, et j\'habiterai dans la maison de l\'Éternel jusqu\'à la fin de mes jours.' }
          ]
        }
      ]
    }
  },

  synodal: {
    1: {
      blocks: [
        { type: 's', heading: 'Путь праведных и путь нечестивых' },
        {
          type: 'q',
          verses: [
            { n: 1, text: 'Блажен муж, который не ходит на совет нечестивых и не стоит на пути грешных и не сидит в собрании развратителей,' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 2, text: 'но в законе Господа воля его, и о законе Его он размышляет день и ночь!' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 3, text: 'И будет он как дерево, посаженное при потоках вод, которое приносит плод свой во время свое, и лист которого не вянет; и во всем, что он ни делает, успеет.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 4, text: 'Не так — нечестивые; но они — как прах, возметаемый ветром.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 5, text: 'Потому не устоят нечестивые на суде, и грешники — в собрании праведных.' }
          ]
        },
        {
          type: 'q',
          verses: [
            { n: 6, text: 'Ибо знает Господь путь праведных, а путь нечестивых погибнет.' }
          ]
        }
      ]
    },
    3: {
      blocks: [
        {
          type: 'q',
          verses: [
            // Notice: In Synodal, the title is verse 1!
            { n: 1, text: 'Псалом Давида, когда он бежал от Авессалома, сына своего.' },
            { n: 2, text: 'Господи! как умножились враги мои! Многие восстают на меня;' },
            { n: 3, text: 'многие говорят душе моей: «нет ему спасения в Боге».' },
            { n: 4, text: 'Но Ты, Господи, щит предо мною, слава моя, и Ты возносишь голову мою.' },
            { n: 5, text: 'Гласом моим взываю к Господу, и Он слышит меня со святой горы Своей.' },
            { n: 6, text: 'Ложусь я, сплю и встаю, ибо Господь защищает меня.' },
            { n: 7, text: 'Не убоюсь тем народа, которые со всех сторон ополчились на меня.' },
            { n: 8, text: 'Воскресни, Господи! спаси меня, Боже мой! ибо Ты поражаешь в ланиту всех врагов моих; сокрушаешь зубы нечестивых.' },
            { n: 9, text: 'От Господа спасение. Над народом Твоим благословение Твое.' }
          ]
        }
      ]
    },
    9: {
      // In Synodal, Psalm 9 combines Hebrew 9 and 10!
      blocks: [
        {
          type: 'q',
          verses: [
            { n: 1, text: 'Начальнику хора. По смерти Лабена. Псалом Давида.' },
            { n: 2, text: 'Буду славить Тебя, Господи, всем сердцем моим, возвещать все чудеса Твои.' },
            { n: 3, text: 'Буду радоваться и торжествовать о Тебе, петь имени Твоему, Всевышний.' },
            { n: 4, text: 'Ибо враги мои обращены назад, преткнутся и погибнут пред лицем Твоим.' },
            { n: 22, text: 'Для чего, Господи, стоишь вдали, скрываешь Себя во время скорби?' },
            { n: 23, text: 'По гордости своей нечестивый преследует бедного: да уловятся они ухищрениями, которые сами вымышляют.' }
          ]
        }
      ]
    },
    22: {
      // In Septuagint/Synodal, Psalm 23 is Psalm 22!
      blocks: [
        {
          type: 'q',
          verses: [
            { n: 1, text: 'Псалом Давида. Господь — Пастырь мой; я ни в чем не буду нуждаться:' },
            { n: 2, text: 'Он покоит меня на злачных пажитях и водит меня к водам тихим,' },
            { n: 3, text: 'подкрепляет душу мою, направляет меня на стези правды ради имени Своего.' },
            { n: 4, text: 'Если я пойду и долиною смертной тени, не убоюсь зла, потому что Ты со мной; Твой жезл и Твой посох — они успокаивают меня.' },
            { n: 5, text: 'Ты приготовил предо мною трапезу в виду врагов моих; умастил елеем голову мою; чаша моя преисполнена.' },
            { n: 6, text: 'Так, благость и милость да сопровождают меня во все дни жизни моей, и я пребуду в доме Господнем многие дни.' }
          ]
        }
      ]
    },
    23: {
      // Synodal Psalm 23 (corresponds to Masoretic Psalm 24)
      blocks: [
        {
          type: 'q',
          verses: [
            { n: 1, text: 'Псалом Давида. В первый день недели. Господня — земля и что наполняет ее, вселенная и все живущее в ней,' },
            { n: 2, text: 'ибо Он основал ее на морях и на реках утвердил ее.' }
          ]
        }
      ]
    }
  }
};

// Generate files
const translations = ['kjv', 'web', 'segond', 'synodal'];

translations.forEach(trans => {
  // Write John
  const johnBook = {
    id: 'JHN',
    slug: 'john',
    name: trans === 'segond' ? 'Jean' : trans === 'synodal' ? 'Иоанн' : 'John',
    translation: trans,
    chapters: johnData[trans] || {}
  };
  fs.writeFileSync(
    path.join('public', 'data', 'bibles', trans, 'john.json'),
    JSON.stringify(johnBook, null, 2)
  );

  // Write Psalms
  const psalmBook = {
    id: 'PSA',
    slug: 'psalms',
    name: trans === 'segond' ? 'Psaumes' : trans === 'synodal' ? 'Псалтирь' : 'Psalms',
    translation: trans,
    chapters: psalmsData[trans] || {}
  };
  fs.writeFileSync(
    path.join('public', 'data', 'bibles', trans, 'psalms.json'),
    JSON.stringify(psalmBook, null, 2)
  );
});

console.log('Bible JSON files generated successfully.');
